export const portalTeachingCourseEvaluationKeys = {
  all: ["portal-teaching-course-evaluations"] as const,

  list: (
    studentId: string | null | undefined,
    filters: {
      schoolYearId?: string | null;
      schoolClassId?: string | null;
      evaluationPeriodId?: string | null;
      courseId?: string | null;
    },
  ) =>
    [
      ...portalTeachingCourseEvaluationKeys.all,
      studentId,
      "list",
      filters,
    ] as const,

  detail: (studentId: string | null | undefined, evaluationId?: string) =>
    [
      ...portalTeachingCourseEvaluationKeys.all,
      studentId,
      "detail",
      evaluationId,
    ] as const,
};
