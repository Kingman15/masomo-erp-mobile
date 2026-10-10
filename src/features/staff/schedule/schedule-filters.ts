export type ScheduleFiltersForm = {
  schoolYearId: string | null;
  schoolClassId: string | null;
  courseId: string | null;
};

export const emptyScheduleFilters: ScheduleFiltersForm = {
  schoolYearId: null,
  schoolClassId: null,
  courseId: null,
};
