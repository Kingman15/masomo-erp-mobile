type CourseAverageKeyFilters = {
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  schoolPeriodId?: string | null;
  schoolYearTermId?: string | null;
};

export const courseAverageKeys = {
  all: ["courseAverages"] as const,

  list: (filters: CourseAverageKeyFilters) =>
    [
      ...courseAverageKeys.all,
      "list",
      {
        schoolYearId: filters.schoolYearId ?? null,
        schoolClassId: filters.schoolClassId ?? null,
        schoolPeriodId: filters.schoolPeriodId ?? null,
        schoolYearTermId: filters.schoolYearTermId ?? null,
      },
    ] as const,
};
