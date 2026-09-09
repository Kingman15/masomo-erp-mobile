export const teachingCourseEvaluationKeys = {
  all: ["teaching-course-evaluations"] as const,

  list: (filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    courseId?: string | null;
    evaluationPeriodId?: string | null;
    teachingCourseEvaluationTypeId?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }) => [...teachingCourseEvaluationKeys.all, "list", filters] as const,

  detail: (id?: string) =>
    [...teachingCourseEvaluationKeys.all, "detail", id] as const,

  documents: (evaluationId?: string) =>
    [
      ...teachingCourseEvaluationKeys.all,
      "detail",
      evaluationId,
      "documents",
    ] as const,
};
