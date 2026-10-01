export type CourseAverageFiltersForm = {
  schoolPeriodId: string | null;
  schoolYearTermId: string | null;
};

export const emptyCourseAverageFilters: CourseAverageFiltersForm = {
  schoolPeriodId: null,
  schoolYearTermId: null,
};
