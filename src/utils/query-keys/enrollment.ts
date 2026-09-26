export const enrollmentKeys = {
  all: ["enrollments"] as const,

  list: (filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    sortBy?: string | null;
    sortDirection?: string | null;
    withoutAttendanceSessionId?: string | null;
  }) => [...enrollmentKeys.all, "list", filters] as const,

  currentEnrollments: (filters: { schoolYearId?: string | null }) =>
    [...enrollmentKeys.all, "currentEnrollments", filters] as const,
};
