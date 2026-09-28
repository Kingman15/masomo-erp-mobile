import api from "@/api/client";
import type { WriteRequestOptions } from "@/api/idempotency";
import {
  store as storeLesson,
  type LessonPayload,
} from "@/api/endpoints/lesson";
import {
  bulkStore as bulkStoreAttendance,
  type StudentAttendanceBulkRecordPayload,
} from "@/api/endpoints/studentAttendanceRecord";
import {
  teacherReport,
  type TeacherReportStudentIncidentPayload,
} from "@/api/endpoints/studentIncident";
import {
  save as saveEvaluationResults,
  type TeachingCourseEvaluationResultPayload,
  type TeachingCourseEvaluationResultSaveResult,
} from "@/api/endpoints/teachingCourseEvaluationResult";
import { toastNotify } from "@/lib/toast";
import { enrollmentKeys } from "@/utils/query-keys/enrollment";
import { lessonKeys } from "@/utils/query-keys/lesson";
import { studentAttendanceRecordKeys } from "@/utils/query-keys/student-attendance-record";
import { studentIncidentKeys } from "@/utils/query-keys/student-incident";
import { teachingCourseEvaluationKeys } from "@/utils/query-keys/teaching-course-evaluation";
import { teachingCourseEvaluationResultKeys } from "@/utils/query-keys/teaching-course-evaluation-result";
import type { Mutation, MutationKey, QueryClient } from "@tanstack/react-query";
import {
  getFailureCode,
  getOfflineFailure,
  isIdempotencyInProgress,
  isRetryableFailure,
  OfflineMutationError,
  type OfflineFailure,
  toOfflineMutationError,
} from "./offline-error";
import { buildClientMetadata } from "./client-metadata";
import { getOfflineOwner } from "./owner";

/**
 * File d'envois hors ligne du poste enseignant.
 * Chaque écriture rejouable a une mutationKey dont les defaults (mutationFn, retry, invalidations) sont enregistrés une fois pour toutes : une mutation restaurée depuis le stockage n'a que sa clé et ses variables, jamais de fonction (non sérialisable).
 */

export const OFFLINE_MUTATION_ROOT = "offline";

export const offlineMutationKeys = {
  lessonCreate: [OFFLINE_MUTATION_ROOT, "lesson.create"],
  attendanceBulk: [OFFLINE_MUTATION_ROOT, "attendance.bulk"],
  gradesSave: [OFFLINE_MUTATION_ROOT, "grades.save"],
  incidentTeacherReport: [OFFLINE_MUTATION_ROOT, "incident.teacherReport"],
} as const;

export type OfflineMutationKey =
  (typeof offlineMutationKeys)[keyof typeof offlineMutationKeys];

export interface OfflinePayloads {
  "lesson.create": LessonPayload;
  "attendance.bulk": StudentAttendanceBulkRecordPayload;
  "grades.save": TeachingCourseEvaluationResultPayload;
  "incident.teacherReport": TeacherReportStudentIncidentPayload;
}

/**
 * Variables persistées avec la mutation.
 * La clé d'idempotence est générée une seule fois à la soumission : elle est réutilisée à chaque nouvel essai, y compris après un redémarrage de l'app.
 */
export interface OfflineVariables<TPayload = unknown> {
  idempotencyKey: string;
  // École + utilisateur à qui appartient l'envoi (cf. owner.ts).
  owner: string | null;
  payload: TPayload;
  // Libellé lisible dans l'écran Synchronisation (ex. « Leçon · Maths 6e A · 12/09 »).
  label: string;
  queuedAt: string;
  // Heure de la saisie sur l'appareil, avec son décalage local (envoyée à l'API, cf. client-metadata.ts).
  // Absente des envois enregistrés avant son ajout : queuedAt (UTC) sert alors.
  recordedAt?: string;
}

export function isOfflineMutationKey(key: MutationKey | undefined): boolean {
  return Array.isArray(key) && key[0] === OFFLINE_MUTATION_ROOT;
}

// --- Envois mis en file (hors ligne, ou réseau en échec à la soumission) ---
// L'écran d'origine est déjà fermé pour eux : le résultat final est annoncé par un toast global.
// Un envoi direct réussi ou refusé en ligne est traité par l'écran lui-même et ne passe pas par là.

const queuedKeys = new Set<string>();

export function markQueued(idempotencyKey: string) {
  queuedKeys.add(idempotencyKey);
}

export function isQueued(idempotencyKey: string | undefined): boolean {
  return Boolean(idempotencyKey && queuedKeys.has(idempotencyKey));
}

function forget(idempotencyKey: string) {
  queuedKeys.delete(idempotencyKey);
}

// Au-delà, la file reste pendante (réseau) mais espace les essais.
const MAX_RETRY_DELAY_MS = 60_000;
// Erreurs serveur répétées : on arrête et on signale plutôt que de boucler.
const MAX_SERVER_ERROR_RETRIES = 8;

function offlineRetry(failureCount: number, error: unknown): boolean {
  const failure = getOfflineFailure(error);
  if (!isRetryableFailure(failure)) return false;

  // Réseau et session : illimité (la coupure peut durer des jours).
  if (!failure || failure.kind !== "http") return true;
  if (
    (failure.status !== null && failure.status >= 500) ||
    isIdempotencyInProgress(failure)
  ) {
    return failureCount < MAX_SERVER_ERROR_RETRIES;
  }
  return true;
}

function offlineRetryDelay(attempt: number): number {
  return Math.min(1_000 * 2 ** attempt, MAX_RETRY_DELAY_MS);
}

type Invalidate<TPayload> = (
  queryClient: QueryClient,
  payload: TPayload,
) => void;

interface OfflineMutationDefinition<TPayload> {
  send: (payload: TPayload, options: WriteRequestOptions) => Promise<unknown>;
  invalidate: Invalidate<TPayload>;
  // Ajuste les envois suivants de la file après une réussite.
  afterSuccess?: (
    queryClient: QueryClient,
    variables: OfflineVariables<TPayload>,
    data: unknown,
  ) => void;
  successMessage: string;
}

/**
 * Une note enregistrée change d'updated_at sur le serveur. Un envoi suivant de la file, saisi sur l'ancienne version de cette même note, serait refusé comme conflit contre notre propre écriture : on le rebase sur la nouvelle version.
 * Le scope séquentiel garantit que ces envois ne sont pas encore partis. Leurs variables sont modifiées en place, car c'est cet objet que reçoit mutationFn à l'essai suivant.
 */
function rebaseQueuedGrades(
  queryClient: QueryClient,
  variables: OfflineVariables<TeachingCourseEvaluationResultPayload>,
  data: unknown,
) {
  const result = data as TeachingCourseEvaluationResultSaveResult | undefined;
  if (!result?.saved?.length) return;

  const { payload } = variables;
  const sentVersions = new Map(
    payload.results.map((row) => [row.enrollmentId, row.expectedUpdatedAt]),
  );
  const newVersions = new Map(
    result.saved.map((row) => [row.enrollment_id, row.updated_at]),
  );

  queryClient
    .getMutationCache()
    .findAll({ mutationKey: offlineMutationKeys.gradesSave, status: "pending" })
    .forEach((mutation) => {
      const queued = mutation.state.variables as
        | OfflineVariables<TeachingCourseEvaluationResultPayload>
        | undefined;
      if (
        !queued ||
        queued.idempotencyKey === variables.idempotencyKey ||
        queued.payload.evaluationId !== payload.evaluationId
      ) {
        return;
      }

      queued.payload.results.forEach((row) => {
        if (
          newVersions.has(row.enrollmentId) &&
          row.expectedUpdatedAt !== undefined &&
          row.expectedUpdatedAt === sentVersions.get(row.enrollmentId)
        ) {
          row.expectedUpdatedAt = newVersions.get(row.enrollmentId) ?? null;
        }
      });
    });
}

const definitions: {
  [K in keyof OfflinePayloads]: OfflineMutationDefinition<OfflinePayloads[K]>;
} = {
  "lesson.create": {
    send: (payload, options) => storeLesson(api, payload, options),
    invalidate: (queryClient) => {
      void queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
    successMessage: "Leçon envoyée",
  },
  "attendance.bulk": {
    send: (payload, options) => bulkStoreAttendance(api, payload, options),
    // Les inscriptions sont filtrées par « non encore pointées » : on les invalide aussi.
    invalidate: (queryClient) => {
      void queryClient.invalidateQueries({
        queryKey: studentAttendanceRecordKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
    },
    successMessage: "Pointage envoyé",
  },
  "grades.save": {
    send: (payload, options) => saveEvaluationResults(api, payload, options),
    invalidate: (queryClient, payload) => {
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationResultKeys.roster(
          payload.evaluationId,
        ),
      });
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationKeys.detail(payload.evaluationId),
      });
    },
    afterSuccess: rebaseQueuedGrades,
    successMessage: "Notes envoyées",
  },
  "incident.teacherReport": {
    send: (payload, options) => teacherReport(api, payload, options),
    invalidate: (queryClient) => {
      void queryClient.invalidateQueries({ queryKey: studentIncidentKeys.all });
    },
    successMessage: "Incident envoyé",
  },
};

function register<K extends keyof OfflinePayloads>(
  queryClient: QueryClient,
  name: K,
) {
  const definition = definitions[name];

  queryClient.setMutationDefaults<
    unknown,
    Error,
    OfflineVariables<OfflinePayloads[K]>
  >([OFFLINE_MUTATION_ROOT, name], {
    mutationFn: async (variables) => {
      if (variables.owner !== getOfflineOwner()) {
        throw new OfflineMutationError(
          {
            kind: "cancelled",
            status: null,
            message: "Envoi d'une autre session, abandonné.",
            data: null,
          },
          null,
        );
      }

      try {
        return await definition.send(variables.payload, {
          idempotencyKey: variables.idempotencyKey,
          client: buildClientMetadata(
            variables.recordedAt ?? variables.queuedAt,
            isQueued(variables.idempotencyKey),
          ),
        });
      } catch (error) {
        throw toOfflineMutationError(error);
      }
    },
    // Hors ligne, la tentative est suspendue (isPaused) puis reprise au retour du réseau.
    networkMode: "offlineFirst",
    retry: offlineRetry,
    retryDelay: offlineRetryDelay,
    // Rejeu séquentiel, dans l'ordre de saisie.
    scope: { id: "teacher-offline" },
    // Un envoi en échec reste visible (écran Synchronisation) jusqu'à ce que
    // l'utilisateur l'ignore ; les réussites sont retirées par le cache (cf. plus bas).
    gcTime: Infinity,
    onSuccess: (data, variables) => {
      definition.afterSuccess?.(queryClient, variables, data);
      definition.invalidate(queryClient, variables.payload);

      if (isQueued(variables.idempotencyKey)) {
        toastNotify(
          `${definition.successMessage} : ${variables.label}`,
          "success",
        );
        forget(variables.idempotencyKey);
      }
    },
    onError: (_error, variables) => {
      if (variables && isQueued(variables.idempotencyKey)) {
        toastNotify(
          `Envoi refusé : ${variables.label}. Voir Synchronisation.`,
          "warning",
        );
      }
    },
  });
}

/**
 * À appeler une fois, avant toute restauration du cache persisté.
 */
export function registerOfflineMutationDefaults(queryClient: QueryClient) {
  (Object.keys(definitions) as (keyof OfflinePayloads)[]).forEach((name) =>
    register(queryClient, name),
  );

  const mutationCache = queryClient.getMutationCache();

  // Ménage : une réussite quitte la file ; un refus d'un envoi direct (l'écran
  // l'a déjà affiché) aussi. Seuls les refus d'envois mis en file restent.
  mutationCache.subscribe((event) => {
    if (event.type !== "updated") return;
    const mutation = event.mutation as
      | Mutation<unknown, unknown, OfflineVariables>
      | undefined;
    if (!mutation || !isOfflineMutationKey(mutation.options.mutationKey))
      return;

    const { status, variables } = mutation.state;
    const shouldRemove =
      status === "success" ||
      (status === "error" && !isQueued(variables?.idempotencyKey));

    if (shouldRemove) {
      // Différé : laisse les callbacks et l'appelant de mutateAsync terminer.
      setTimeout(() => mutationCache.remove(mutation), 0);
    }
  });
}

/**
 * Relance les envois restaurés depuis le stockage.
 *
 * resumePausedMutations() seul ne suffit pas : une mutation sauvegardée en plein essai n'est pas marquée « en pause » et serait ignorée.
 * On relance donc chaque envoi en attente ; le scope `teacher-offline` garantit qu'ils partent un par un, dans l'ordre.
 * Relancer chacun (plutôt que le premier seulement, le scope enchaînant les suivants) attache un .catch à chaque promesse : sinon un refus d'un envoi repris par le scope sort en rejet non géré.
 * Vérifié sur query-core 5.104 : chaque envoi part exactement une fois.
 */
export async function resumeOfflineQueue(queryClient: QueryClient) {
  const pending = queryClient
    .getMutationCache()
    .getAll()
    .filter(
      (mutation) =>
        isOfflineMutationKey(mutation.options.mutationKey) &&
        mutation.state.status === "pending",
    );

  pending.forEach((mutation) => {
    const variables = mutation.state.variables as OfflineVariables | undefined;
    if (variables) markQueued(variables.idempotencyKey);
  });

  await Promise.all(
    pending.map((mutation) => mutation.continue().catch(() => undefined)),
  );
}

/**
 * Payload à renvoyer pour appliquer le reste d'un envoi refusé pour conflit (409), sans toucher aux lignes en conflit.
 * null si le refus n'est pas un conflit qui le permet.
 * C'est une nouvelle intention : elle part avec une nouvelle clé d'idempotence.
 */
export function payloadIgnoringConflicts<K extends keyof OfflinePayloads>(
  name: K,
  payload: OfflinePayloads[K],
  failure: OfflineFailure | null,
): OfflinePayloads[K] | null {
  const code = getFailureCode(failure);

  if (name === "attendance.bulk" && code === "ATTENDANCE_CONFLICT") {
    return { ...payload, conflictStrategy: "skip_existing" };
  }
  if (name === "grades.save" && code === "GRADES_CONFLICT") {
    return { ...payload, conflictStrategy: "skip_conflicts" };
  }
  return null;
}

/**
 * Une même saisie (même clé d'idempotence) ne doit figurer qu'une fois dans la file : on garde la plus ancienne, déjà engagée dans le scope.
 */
export function removeDuplicateOfflineMutations(queryClient: QueryClient) {
  const mutationCache = queryClient.getMutationCache();
  const seen = new Set<string>();

  mutationCache.getAll().forEach((mutation) => {
    const variables = mutation.state.variables as OfflineVariables | undefined;
    if (!variables || !isOfflineMutationKey(mutation.options.mutationKey)) {
      return;
    }

    if (seen.has(variables.idempotencyKey)) {
      mutationCache.remove(mutation);
    } else {
      seen.add(variables.idempotencyKey);
    }
  });
}

/**
 * Les refus restaurés viennent forcément d'envois mis en file.
 */
export function markRestoredFailuresAsQueued(queryClient: QueryClient) {
  queryClient
    .getMutationCache()
    .getAll()
    .forEach((mutation) => {
      const variables = mutation.state.variables as
        | OfflineVariables
        | undefined;
      if (
        variables &&
        isOfflineMutationKey(mutation.options.mutationKey) &&
        mutation.state.status === "error"
      ) {
        markQueued(variables.idempotencyKey);
      }
    });
}
