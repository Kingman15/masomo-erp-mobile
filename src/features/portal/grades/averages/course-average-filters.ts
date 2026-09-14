export type CourseAverageFiltersForm = {
  evaluationPeriodId: string | null;
  sysyId: string | null;
};

export const emptyCourseAverageFilters: CourseAverageFiltersForm = {
  evaluationPeriodId: null,
  sysyId: null,
};
