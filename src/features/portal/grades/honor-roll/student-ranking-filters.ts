export type StudentRankingFiltersForm = {
  evaluationPeriodId: string | null;
  sysyId: string | null;
};

export const emptyStudentRankingFilters: StudentRankingFiltersForm = {
  evaluationPeriodId: null,
  sysyId: null,
};
