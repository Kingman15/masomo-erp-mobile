import type {
  DeliberationSession,
  EnrollmentDecisionBulkItem,
  EnrollmentDecisionGridRow,
  EnrollmentDecisionType,
  EnrollmentDecisionTypeValue,
  EnrollmentMakeUpCourse,
  EnrollmentPointAdjustment,
} from "@/utils/types/EnrollmentDecision";

// Saisie d'un élève, gardée en mémoire jusqu'à « Enregistrer » (même logique que la grille web).
export type DecisionDraft = {
  decision: EnrollmentDecisionTypeValue | null;
  reorientationNote: string | null;
  comments: string | null;
  makeUpCourses: EnrollmentMakeUpCourse[];
  // null = ajustements de points inchangés ; liste = remplace tous les ajustements de l'élève
  adjustments: EnrollmentPointAdjustment[] | null;
};

export type DecisionRow = {
  source: EnrollmentDecisionGridRow;
  original: DecisionDraft;
  draft: DecisionDraft;
};

export function studentLabel(row: EnrollmentDecisionGridRow) {
  return row.studentName ?? row.enrollmentNumber ?? "Élève";
}

// La proposition n'est montrée qu'aux élèves sans décision enregistrée : après délibération, elle est recalculée avec les points ajustés et n'a plus de sens.
export function visibleProposal(row: EnrollmentDecisionGridRow) {
  return row.decision === null ? row.proposedDecision : null;
}

function toDraft(row: EnrollmentDecisionGridRow): DecisionDraft {
  return {
    decision: row.decision?.value ?? null,
    reorientationNote: row.decision?.reorientationNote ?? null,
    comments: row.decision?.comments ?? null,
    makeUpCourses: (row.decision?.makeUpExams ?? []).map((exam) => ({
      followCourseId: exam.followCourseId,
      courseName: exam.courseName,
      percentage: exam.percentage,
      passed: exam.passed,
      comments: exam.comments,
    })),
    adjustments: null,
  };
}

export function toRow(row: EnrollmentDecisionGridRow): DecisionRow {
  const draft = toDraft(row);
  return { source: row, original: draft, draft };
}

export function coursesFromFailed(
  row: EnrollmentDecisionGridRow,
): EnrollmentMakeUpCourse[] {
  return row.failedCourses.map((course) => ({
    followCourseId: course.followCourseId,
    courseName: course.courseName,
    percentage: null,
    passed: null,
    comments: null,
  }));
}

// Ce qui est réellement envoyé pour une ligne (sert aussi à détecter les modifications).
// Clé `adjustments` seulement si les points ajustés ont changé : absente, le serveur les garde tels quels.
export function toPayloadItem(
  enrollmentId: string,
  draft: DecisionDraft,
): EnrollmentDecisionBulkItem {
  return {
    enrollment_id: enrollmentId,
    decision: draft.decision,
    reorientation_note:
      draft.decision === "failed" ? draft.reorientationNote : null,
    comments: draft.comments,
    make_up_courses:
      draft.decision === "make_up_exam"
        ? draft.makeUpCourses.map((course) => ({
            follow_course_id: course.followCourseId,
            percentage: course.percentage,
            passed: course.passed,
            comments: course.comments,
          }))
        : [],
    ...(draft.adjustments !== null && {
      adjustments: draft.adjustments.map((adjustment) => ({
        follow_course_id: adjustment.followCourseId,
        school_period_id: adjustment.schoolPeriodId,
        adjusted_points: adjustment.adjustedPoints,
        reason: adjustment.reason,
      })),
    }),
  };
}

export function isChanged(row: DecisionRow) {
  const id = row.source.enrollmentId;
  return (
    JSON.stringify(toPayloadItem(id, row.draft)) !==
    JSON.stringify(toPayloadItem(id, row.original))
  );
}

// Décisions proposées au choix : pas de nouveau « repêchage » en 2ème session ni pour une classe qui n'en a pas
// (refusé aussi par l'API), mais un repêchage déjà enregistré en 1ère session reste affichable.
export function selectableDecisionTypes(
  all: EnrollmentDecisionType[],
  session: DeliberationSession,
  hasMakeUpExams: boolean,
  rows: DecisionRow[],
) {
  if (session === 2) return all.filter((type) => type.value !== "make_up_exam");

  const keepMakeUp =
    hasMakeUpExams ||
    rows.some((row) => row.original.decision === "make_up_exam");
  return keepMakeUp
    ? all
    : all.filter((type) => type.value !== "make_up_exam");
}

export function isInvalidPercentage(percentage: number | null) {
  return (
    percentage !== null &&
    (Number.isNaN(percentage) || percentage < 0 || percentage > 100)
  );
}

export const DECISION_TONES: Record<
  EnrollmentDecisionTypeValue,
  { container: string; text: string }
> = {
  passes: {
    container: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-700 dark:text-green-300",
  },
  make_up_exam: {
    container: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-700 dark:text-amber-300",
  },
  repeats: {
    container: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-700 dark:text-red-300",
  },
  failed: {
    container: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-700 dark:text-red-300",
  },
};
