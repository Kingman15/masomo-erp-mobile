export type TeachingCourseFiltersForm = {
  schoolYearId: string | null;
  schoolClassId: string | null;
  courseId: string | null;
};

export const emptyTeachingCourseFilters: TeachingCourseFiltersForm = {
  schoolYearId: null,
  schoolClassId: null,
  courseId: null,
};
