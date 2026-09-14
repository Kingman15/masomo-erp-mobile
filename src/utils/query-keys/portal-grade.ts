export const portalGradeKeys = {
  all: ["portal-grades"] as const,

  list: (
    studentId: string | null | undefined,
    filters: {
      schoolYearId?: string | null;
      schoolClassId?: string | null;
      evaluationPeriodId?: string | null;
      courseId?: string | null;
    },
  ) => [...portalGradeKeys.all, studentId, "list", filters] as const,
};
