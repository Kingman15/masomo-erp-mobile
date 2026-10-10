export type LessonFiltersForm = {
  schoolYearId: string | null;
  schoolClassId: string | null;
  courseId: string | null;
  startDate: string | null;
  endDate: string | null;
};

export const emptyLessonFilters: LessonFiltersForm = {
  schoolYearId: null,
  schoolClassId: null,
  courseId: null,
  startDate: null,
  endDate: null,
};
