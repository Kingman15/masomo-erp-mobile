import api from "@/api/client";
import { store as storeLesson, type LessonPayload } from "@/api/endpoints/lesson";
import {
  bulkStore as bulkStoreAttendance,
  type StudentAttendanceBulkRecordPayload,
} from "@/api/endpoints/studentAttendanceRecord";
import {
  teacherReport,
  type TeacherReportStudentIncidentPayload,
} from "@/api/endpoints/studentIncident";
import { save as saveEvaluationResults } from "@/api/endpoints/teachingCourseEvaluationResult";
import { toastNotify } from "@/lib/toast";
import { enrollmentKeys } from "@/utils/query-keys/enrollment";
import { lessonKeys } from "@/utils/query-keys/lesson";
import { studentAttendanceRecordKeys } from "@/utils/query-keys/student-attendance-record";
import { studentIncidentKeys } from "@/utils/query-keys/student-incident";
import { teachingCourseEvaluationKeys } from "@/utils/query-keys/teaching-course-evaluation";
import { teachingCourseEvaluationResultKeys } from "@/utils/query-keys/teaching-course-evaluation-result";
import type { TeachingCourseEvaluationResultFormValues } from "@/utils/schemas/teaching-course-evaluation-result-schema";
import type { Mutation, MutationKey, QueryClient } from "@tanstack/react-query";
import {
  getOfflineFailure,
  isRetryableFailure,
  OfflineMutationError,
  toOfflineMutationError,
} from "./offline-error";
import { getOfflineOwner } from "./owner";

/**
 * File d'envois hors ligne du poste enseignant.
 *
 * Chaque écriture rejouable a une mutationKey dont les defaults (mutationFn,
 * retry, invalidations) sont enregistrés une fois pour toutes : une mutation
 * restaurée depuis le stockage n'a que sa clé et ses variables, jamais de
 * fonction (non sérialisable).
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
  "grades.save": TeachingCourseEvaluationResultFormValues;
  "incident.teacherReport": TeacherReportStudentIncidentPayload;
}

/**
 * Variables persistées avec la mutation. La clé d'idempotence est générée une
 * seule fois à la soumission : elle est réutilisée à chaque nouvel essai, y
 * compris après un redémarrage de l'app.
 */
export interface OfflineVariables<TPayload = unknown> {
  idempotencyKey: string;
  // École + utilisateur à qui appartient l'envoi (cf. owner.ts).
  owner: string | null;
  payload: TPayload;
  // Libellé lisible dans l'écran Synchronisation (ex. « Leçon · Maths 6e A · 12/09 »).
  label: string;
  queuedAt: string;
}

export function isOfflineMutationKey(key: MutationKey | undefined): boolean {
  return Array.isArray(key) && key[0] === OFFLINE_MUTATION_ROOT;
}

// --- Envois mis en file (hors ligne, ou réseau en échec à la soumission) ---
// L'écran d'origine est déjà fermé pour eux : le résultat final est annoncé
// par un toast global. Un envoi direct réussi ou refusé en ligne est traité par
// l'écran lui-même et ne passe pas par là.

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
  if (failure.status !== null && failure.status >= 500) {
    return failureCount < MAX_SERVER_ERROR_RETRIES;
  }
  return true;
}

function offlineRetryDelay(attempt: number): number {
  return Math.min(1_000 * 2 ** attempt, MAX_RETRY_DELAY_MS);
}

type Invalidate<TPayload> = (queryClient: QueryClient, payload: TPayload) => void;

interface OfflineMutationDefinition<TPayload> {
  send: (payload: TPayload, idempotencyKey: string) => Promise<unknown>;
  invalidate: Invalidate<TPayload>;
  successMessage: string;
}

const definitions: {
  [K in keyof OfflinePayloads]: OfflineMutationDefinition<OfflinePayloads[K]>;
} = {
  "lesson.create": {
    send: (payload, idempotencyKey) => storeLesson(api, payload, { idempotencyKey }),
    invalidate: (queryClient) => {
      void queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
    successMessage: "Leçon envoyée",
  },
  "attendance.bulk": {
    send: (payload, idempotencyKey) =>
      bulkStoreAttendance(api, payload, { idempotencyKey }),
    // Les inscriptions sont filtrées par « non encore pointées » : on les invalide aussi.
    invalidate: (queryClient) => {
      void queryClient.invalidateQueries({ queryKey: studentAttendanceRecordKeys.all });
      void queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
    },
    successMessage: "Pointage envoyé",
  },
  "grades.save": {
    send: (payload, idempotencyKey) =>
      saveEvaluationResults(api, payload, { idempotencyKey }),
    invalidate: (queryClient, payload) => {
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationResultKeys.roster(payload.evaluationId),
      });
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationKeys.detail(payload.evaluationId),
      });
    },
    successMessage: "Notes envoyées",
  },
  "incident.teacherReport": {
    send: (payload, idempotencyKey) => teacherReport(api, payload, { idempotencyKey }),
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
        return await definition.send(variables.payload, variables.idempotencyKey);
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
    onSuccess: (_data, variables) => {
      definition.invalidate(queryClient, variables.payload);

      if (isQueued(variables.idempotencyKey)) {
        toastNotify(`${definition.successMessage} : ${variables.label}`, "success");
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
    const mutation = event.mutation as Mutation<unknown, unknown, OfflineVariables> | undefined;
    if (!mutation || !isOfflineMutationKey(mutation.options.mutationKey)) return;

    const { status, variables } = mutation.state;
    const shouldRemove =
      status === "success" || (status === "error" && !isQueued(variables?.idempotencyKey));

    if (shouldRemove) {
      // Différé : laisse les callbacks et l'appelant de mutateAsync terminer.
      setTimeout(() => mutationCache.remove(mutation), 0);
    }
  });
}

/**
 * Relance les envois restaurés depuis le stockage.
 *
 * resumePausedMutations() seul ne suffit pas : une mutation sauvegardée en
 * plein essai n'est pas marquée « en pause » et serait ignorée. On relance donc
 * chaque envoi en attente ; le scope `teacher-offline` garantit qu'ils partent
 * un par un, dans l'ordre. Relancer chacun (plutôt que le premier seulement,
 * le scope enchaînant les suivants) attache un .catch à chaque promesse :
 * sinon un refus d'un envoi repris par le scope sort en rejet non géré.
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

  await Promise.all(pending.map((mutation) => mutation.continue().catch(() => undefined)));
}

/**
 * Les refus restaurés viennent forcément d'envois mis en file.
 */
export function markRestoredFailuresAsQueued(queryClient: QueryClient) {
  queryClient
    .getMutationCache()
    .getAll()
    .forEach((mutation) => {
      const variables = mutation.state.variables as OfflineVariables | undefined;
      if (
        variables &&
        isOfflineMutationKey(mutation.options.mutationKey) &&
        mutation.state.status === "error"
      ) {
        markQueued(variables.idempotencyKey);
      }
    });
}
