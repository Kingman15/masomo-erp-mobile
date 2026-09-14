export type GradeFiltersForm = {
  courseId: string | null;
  evaluationPeriodId: string | null;
  evaluationType: string | null;
};

export const emptyGradeFilters: GradeFiltersForm = {
  courseId: null,
  evaluationPeriodId: null,
  evaluationType: null,
};
