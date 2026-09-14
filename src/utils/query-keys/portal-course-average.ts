export const portalCourseAverageKeys = {
  all: ["portal-course-averages"] as const,

  list: (
    studentId: string | null | undefined,
    filters: {
      schoolYearId?: string | null;
      schoolClassId?: string | null;
      evaluationPeriodId?: string | null;
      sysyId?: string | null;
    },
  ) => [...portalCourseAverageKeys.all, studentId, "list", filters] as const,
};
