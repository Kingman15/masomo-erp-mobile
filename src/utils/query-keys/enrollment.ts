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

  // Liste paginée (écran Élèves) : clé distincte de la liste complète, dont le cache n'a pas la même forme.
  pages: (filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    searchTerm?: string | null;
  }) => [...enrollmentKeys.all, "pages", filters] as const,

  detail: (id?: string) => [...enrollmentKeys.all, "detail", id] as const,

  reportCard: (enrollmentId: string | null | undefined) =>
    [...enrollmentKeys.all, "reportCard", enrollmentId ?? null] as const,
};
