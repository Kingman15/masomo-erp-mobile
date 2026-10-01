export const portalStudentRankingKeys = {
  all: ["portal-student-rankings"] as const,

  list: (
    studentId: string | null | undefined,
    filters: {
      schoolYearId?: string | null;
      schoolClassId?: string | null;
      schoolPeriodId?: string | null;
      schoolYearTermId?: string | null;
    },
  ) => [...portalStudentRankingKeys.all, studentId, "list", filters] as const,
};
