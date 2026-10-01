export type EvaluationFiltersForm = {
  schoolYearId: string | null;
  schoolClassId: string | null;
  courseId: string | null;
  schoolPeriodId: string | null;
  teachingCourseEvaluationTypeId: string | null;
  startDate: string | null;
  endDate: string | null;
};

export const emptyEvaluationFilters: EvaluationFiltersForm = {
  schoolYearId: null,
  schoolClassId: null,
  courseId: null,
  schoolPeriodId: null,
  teachingCourseEvaluationTypeId: null,
  startDate: null,
  endDate: null,
};
