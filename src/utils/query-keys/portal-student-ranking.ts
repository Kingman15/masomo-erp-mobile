export const portalStudentRankingKeys = {
  all: ["portal-student-rankings"] as const,

  list: (
    studentId: string | null | undefined,
    filters: {
      schoolYearId?: string | null;
      schoolClassId?: string | null;
      evaluationPeriodId?: string | null;
      sysyId?: string | null;
    },
  ) => [...portalStudentRankingKeys.all, studentId, "list", filters] as const,
};
