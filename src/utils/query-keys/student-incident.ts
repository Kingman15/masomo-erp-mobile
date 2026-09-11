export const studentIncidentKeys = {
  all: ["student-incidents"] as const,

  list: (filters: {
    schoolYearId?: string | null;
    incidentTypeId?: string | null;
    status?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    searchTerm?: string | null;
    studentId?: string | null;
  }) => [...studentIncidentKeys.all, "list", filters] as const,

  detail: (id?: string) => [...studentIncidentKeys.all, "detail", id] as const,
};
