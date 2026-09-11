export const studentIncidentSanctionKeys = {
  all: ["student-incident-sanctions"] as const,

  list: (filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    sanctionTypeId?: string | null;
    incidentTypeId?: string | null;
    status?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }) => [...studentIncidentSanctionKeys.all, "list", filters] as const,

  detail: (id?: string) =>
    [...studentIncidentSanctionKeys.all, "detail", id] as const,
};
