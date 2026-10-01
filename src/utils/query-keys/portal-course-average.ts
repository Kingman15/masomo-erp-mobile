export const portalCourseAverageKeys = {
  all: ["portal-course-averages"] as const,

  list: (
    studentId: string | null | undefined,
    filters: {
      schoolYearId?: string | null;
      schoolClassId?: string | null;
      schoolPeriodId?: string | null;
      schoolYearTermId?: string | null;
    },
  ) => [...portalCourseAverageKeys.all, studentId, "list", filters] as const,
};
