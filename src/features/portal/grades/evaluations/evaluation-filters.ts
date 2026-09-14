export type EvaluationFiltersForm = {
  courseId: string | null;
  evaluationPeriodId: string | null;
  evaluationType: string | null;
};

export const emptyEvaluationFilters: EvaluationFiltersForm = {
  courseId: null,
  evaluationPeriodId: null,
  evaluationType: null,
};
