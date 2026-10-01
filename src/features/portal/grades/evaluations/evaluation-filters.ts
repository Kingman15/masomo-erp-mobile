export type EvaluationFiltersForm = {
  courseId: string | null;
  schoolPeriodId: string | null;
  evaluationType: string | null;
};

export const emptyEvaluationFilters: EvaluationFiltersForm = {
  courseId: null,
  schoolPeriodId: null,
  evaluationType: null,
};
