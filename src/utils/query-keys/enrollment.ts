export const enrollmentKeys = {
  all: ["enrollments"] as const,

  currentEnrollments: (filters: { schoolYearId?: string | null }) =>
    [...enrollmentKeys.all, "currentEnrollments", filters] as const,
};
