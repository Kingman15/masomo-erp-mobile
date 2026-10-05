import { followedCoursesQuery } from "@/hooks/queries/items/course";
import { activeCourseScheduleQuery } from "@/hooks/queries/items/course-schedule";
import { currentTeacherQuery } from "@/hooks/queries/items/employee";
import { enrollmentsQuery } from "@/hooks/queries/items/enrollment";
import { schoolPeriodsQuery } from "@/hooks/queries/items/school-period";
import { incidentTypesQuery } from "@/hooks/queries/items/incident-type";
import { schoolCalendarQuery } from "@/hooks/queries/items/school-calendar";
import { schoolClassesQuery } from "@/hooks/queries/items/school-class";
import { schoolSpacesQuery } from "@/hooks/queries/items/school-space";
import {
  currentSchoolYearQuery,
  schoolYearsQuery,
} from "@/hooks/queries/items/school-year";
import { studentAttendancePointingChannelsQuery } from "@/hooks/queries/items/student-attendance-pointing-channel";
import { studentAttendanceRegistersQuery } from "@/hooks/queries/items/student-attendance-register";
import { studentAttendanceSessionsQuery } from "@/hooks/queries/items/student-attendance-session";
import { studentInternalRegulationsQuery } from "@/hooks/queries/items/student-internal-regulation";
import { studentRegulationArticlesQuery } from "@/hooks/queries/items/student-regulation-article";
import { teachingCoursesQuery } from "@/hooks/queries/items/teaching-course";
import {
  teachingCourseEvaluationQuery,
  teachingCourseEvaluationsQuery,
} from "@/hooks/queries/items/teaching-course-evaluation";
import { teachingCourseEvaluationResultRosterQuery } from "@/hooks/queries/items/teaching-course-evaluation-result";
import { teachingCourseEvaluationTypesQuery } from "@/hooks/queries/items/teaching-course-evaluation-type";
import { teachingScheduleDTOsQuery } from "@/hooks/queries/items/teaching-schedule";
import {
  getNextInfiniteScrollPage,
  INFINITE_SCROLL_PER_PAGE,
} from "@/hooks/queries/use-infinite-scroll-query";
import {
  fetchOfflineQuery,
  OFFLINE_QUERY_GC_TIME,
  PREFETCH_STALE_TIME_MS,
  queryMeta,
  type QueryDefinition,
} from "@/lib/offline/offline-queries";
import { userCan } from "@/hooks/use-can";
import { useIsOnline } from "@/lib/offline/use-offline-queue";
import { useAuthStore } from "@/stores/auth";
import type { StudentInternalRegulation } from "@/utils/types/StudentInternalRegulation";
import type { TeachingCourseEvaluation } from "@/utils/types/TeachingCourseEvaluation";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { classEnrollmentsFilters } from "./attendance/class-enrollments";

/**
 * Précharge, à chaque passage en ligne, ce dont le poste enseignant a besoin pour travailler sans réseau : horaire, ROI et données des formulaires (leçon, pointage, incident, notes).
 * Tout passe par les mêmes définitions que les hooks des écrans, donc par les mêmes clés de cache ; une donnée récupérée depuis moins de 30 min n'est pas redemandée.
 */
export function useTeacherOfflinePrefetch() {
  const queryClient = useQueryClient();
  const isOnline = useIsOnline();
  const userId = useAuthStore((s) => s.user?.id);
  // Un droit accordé (relu via /me) déclenche le préchargement des écrans qu'il ouvre ; le reste, déjà frais, n'est pas redemandé.
  const permissionsKey = useAuthStore((s) => s.user?.permissions.join(","));

  useEffect(() => {
    if (!isOnline || !userId) return;

    const run = { cancelled: false };
    void prefetchTeacherOfflineData(queryClient, run);

    return () => {
      run.cancelled = true;
    };
  }, [queryClient, isOnline, userId, permissionsKey]);
}

// Évaluations dont la grille est préchargée : les récentes et celles à venir, les plus susceptibles d'être notées.
const RECENT_EVALUATION_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
// Limite la rafale de requêtes au retour du réseau.
const MAX_CONCURRENT_REQUESTS = 4;

type RunState = { cancelled: boolean };

async function prefetchTeacherOfflineData(
  queryClient: QueryClient,
  run: RunState,
) {
  // Un échec (droit manquant, réseau qui retombe) n'empêche pas le reste.
  const load = <T>(definition: QueryDefinition<T>): Promise<T | undefined> =>
    run.cancelled
      ? Promise.resolve(undefined)
      : fetchOfflineQuery(queryClient, definition).catch(() => undefined);

  // Écrans soumis à une permission : sans elle l'API répondrait 403, inutile de la solliciter. Les référentiels restent préchargés.
  const can = (...permissions: string[]) =>
    permissions.every((permission) =>
      userCan(useAuthStore.getState().user, permission),
    );

  const [schoolYear, teacher] = await Promise.all([
    load(currentSchoolYearQuery()),
    load(currentTeacherQuery()),
    load(schoolYearsQuery()),
    load(schoolSpacesQuery()),
    load(incidentTypesQuery()),
    can("attendance.pointingChannels.view")
      ? load(studentAttendancePointingChannelsQuery())
      : undefined,
    load(schoolPeriodsQuery()),
    load(teachingCourseEvaluationTypesQuery()),
  ]);

  const schoolYearId = schoolYear?.id ?? null;
  if (!schoolYearId || run.cancelled) return;

  // Pour un enseignant, l'API ramène toujours school-classes et followed-courses à ses propres enseignements (TeacherScope), quel que soit le teacherId envoyé.
  const [taughtClasses = [], homeroomClasses = []] = await Promise.all([
    load(schoolClassesQuery({ schoolYearId })),
    // Classes que l'enseignant peut pointer : celles dont il est titulaire (liste de l'écran de pointage).
    teacher
      ? load(schoolClassesQuery({ teacherId: teacher.id, homeroom: true }))
      : undefined,
  ]);

  // Élèves : pointage (classes du titulaire) et choix d'élève d'un incident (toutes ses classes).
  const studentClassIds = [
    ...new Set(
      [...taughtClasses, ...homeroomClasses].map((schoolClass) => schoolClass.id),
    ),
  ];

  await Promise.all([
    // Horaire hebdomadaire (écran Horaire, et heures de leçon hors ligne).
    (async () => {
      if (!can("academics.schedules::teaching.view")) return;
      const courseSchedule = await load(activeCourseScheduleQuery(schoolYearId));
      if (courseSchedule) {
        await load(
          teachingScheduleDTOsQuery({ courseScheduleId: courseSchedule.id }),
        );
      }
    })(),


    // Calendrier scolaire (dates des périodes des classes de l'enseignant).
    load(schoolCalendarQuery(schoolYearId)),

    // ROI : filtres par défaut de l'écran.
    (async () => {
      if (!can("discipline.internalRegulations.view")) return;
      const regulations = await load(
        studentInternalRegulationsQuery({ schoolYearId, targetType: "global" }),
      );
      const regulation = pickDefaultRegulation(regulations ?? []);
      if (regulation) {
        await load(studentRegulationArticlesQuery(regulation.id));
      }
    })(),

    // Formulaire de leçon : cours suivis de chaque classe, puis enseignement de chaque cours.
    runWithConcurrency(
      (can(
        "academics.lessons.create",
        "academics.followCourses.view",
        "academics.teachingCourses.view",
      )
        ? taughtClasses
        : []
      ).map(({ id: schoolClassId }) => async () => {
        const courses = await load(
          followedCoursesQuery({ schoolYearId, schoolClassId, teacherId: null }),
        );
        for (const course of courses ?? []) {
          await load(
            teachingCoursesQuery({
              schoolYearId,
              schoolClassId,
              courseId: course.id,
            }),
          );
        }
      }),
    ),

    // Pointage : sessions des registres ouverts.
    (async () => {
      if (!can("attendance.registers.view", "attendance.sessions.view")) return;
      const registers = await load(
        studentAttendanceRegistersQuery({ schoolYearId }),
      );
      await runWithConcurrency(
        (registers ?? [])
          .filter((register) => register.status === "open")
          .map((register) => () =>
            load(studentAttendanceSessionsQuery({ registerId: register.id })),
          ),
      );
    })(),

    runWithConcurrency(
      studentClassIds.map((schoolClassId) => () =>
        load(
          enrollmentsQuery(classEnrollmentsFilters(schoolYearId, schoolClassId)),
        ),
      ),
    ),

    // Notes : première page des évaluations, puis fiche et grille des récentes.
    (async () => {
      if (!can("academics.evaluations::courseEvaluations.view")) return;
      const evaluations = await loadFirstEvaluationsPage(
        queryClient,
        schoolYearId,
        run,
      );
      await runWithConcurrency(
        evaluations.filter(isRecentEvaluation).map((evaluation) => () =>
          Promise.all([
            load(teachingCourseEvaluationQuery(evaluation.id)),
            load(teachingCourseEvaluationResultRosterQuery(evaluation.id)),
          ]),
        ),
      );
    })(),
  ]);
}

// Même choix que l'écran ROI : le dernier règlement actif.
function pickDefaultRegulation(
  regulations: StudentInternalRegulation[],
): StudentInternalRegulation | undefined {
  return regulations
    .filter((regulation) => regulation.isActive)
    .sort((a, b) => b.id.localeCompare(a.id))[0];
}

function isRecentEvaluation(evaluation: TeachingCourseEvaluation): boolean {
  if (!evaluation.evaluationDate) return false;
  const time = new Date(evaluation.evaluationDate).getTime();
  return (
    !Number.isNaN(time) && time >= Date.now() - RECENT_EVALUATION_WINDOW_MS
  );
}

// Liste paginée : même forme de cache que useTeachingCourseEvaluations (filtres par défaut de l'écran).
async function loadFirstEvaluationsPage(
  queryClient: QueryClient,
  schoolYearId: string,
  run: RunState,
): Promise<TeachingCourseEvaluation[]> {
  if (run.cancelled) return [];

  const { queryKey, queryFn, label } = teachingCourseEvaluationsQuery({
    schoolYearId,
  });

  try {
    const data = await queryClient.fetchInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) => queryFn(pageParam, INFINITE_SCROLL_PER_PAGE),
      initialPageParam: 1,
      getNextPageParam: getNextInfiniteScrollPage,
      staleTime: PREFETCH_STALE_TIME_MS,
      gcTime: OFFLINE_QUERY_GC_TIME,
      meta: queryMeta(label, true),
    });
    return data.pages.flatMap((page) => page.data);
  } catch {
    return [];
  }
}

async function runWithConcurrency(
  tasks: (() => Promise<unknown>)[],
  limit = MAX_CONCURRENT_REQUESTS,
) {
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const task = tasks[next++];
      await task().catch(() => undefined);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker),
  );
}
