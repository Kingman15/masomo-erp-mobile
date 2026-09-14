import { StudentIncidentSanctionStatus } from "@/utils/types/StudentIncidentSanction";

export const portalSanctionKeys = {
  all: ["portal-sanctions"] as const,

  list: (
    studentId: string | null | undefined,
    filters: {
      schoolYearId?: string | null;
      incidentTypeId?: string | null;
      sanctionTypeId?: string | null;
      status?: StudentIncidentSanctionStatus | null;
      startDate?: string | null;
      endDate?: string | null;
      schoolClassId?: string | null;
    },
  ) => [...portalSanctionKeys.all, studentId, "list", filters] as const,

  detail: (studentId: string | null | undefined, sanctionId?: string) =>
    [...portalSanctionKeys.all, studentId, "detail", sanctionId] as const,
};
