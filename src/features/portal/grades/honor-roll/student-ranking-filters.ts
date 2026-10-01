export type StudentRankingFiltersForm = {
  schoolPeriodId: string | null;
  schoolYearTermId: string | null;
};

export const emptyStudentRankingFilters: StudentRankingFiltersForm = {
  schoolPeriodId: null,
  schoolYearTermId: null,
};
