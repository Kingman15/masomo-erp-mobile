export type EvaluationFiltersForm = {
  schoolYearId: string | null;
  schoolClassId: string | null;
  courseId: string | null;
  evaluationPeriodId: string | null;
  teachingCourseEvaluationTypeId: string | null;
  startDate: string | null;
  endDate: string | null;
};

export const emptyEvaluationFilters: EvaluationFiltersForm = {
  schoolYearId: null,
  schoolClassId: null,
  courseId: null,
  evaluationPeriodId: null,
  teachingCourseEvaluationTypeId: null,
  startDate: null,
  endDate: null,
};
