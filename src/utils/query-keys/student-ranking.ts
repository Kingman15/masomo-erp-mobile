type StudentRankingKeyFilters = {
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  schoolPeriodId?: string | null;
  schoolYearTermId?: string | null;
};

export const studentRankingKeys = {
  all: ["studentRankings"] as const,

  list: (filters: StudentRankingKeyFilters) =>
    [
      ...studentRankingKeys.all,
      "list",
      {
        schoolYearId: filters.schoolYearId ?? null,
        schoolClassId: filters.schoolClassId ?? null,
        schoolPeriodId: filters.schoolPeriodId ?? null,
        schoolYearTermId: filters.schoolYearTermId ?? null,
      },
    ] as const,
};
