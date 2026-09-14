import { StudentIncidentStatus } from "@/utils/types/StudentIncident";

export const portalIncidentKeys = {
  all: ["portal-incidents"] as const,

  list: (
    studentId: string | null | undefined,
    filters: {
      schoolYearId?: string | null;
      status?: StudentIncidentStatus | null;
      startDate?: string | null;
      endDate?: string | null;
      schoolClassId?: string | null;
    },
  ) => [...portalIncidentKeys.all, studentId, "list", filters] as const,

  detail: (studentId: string | null | undefined, incidentId?: string) =>
    [...portalIncidentKeys.all, studentId, "detail", incidentId] as const,
};
