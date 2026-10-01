export type GradeFiltersForm = {
  courseId: string | null;
  schoolPeriodId: string | null;
  evaluationType: string | null;
};

export const emptyGradeFilters: GradeFiltersForm = {
  courseId: null,
  schoolPeriodId: null,
  evaluationType: null,
};
