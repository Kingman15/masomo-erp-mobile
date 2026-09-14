import { StudentIncidentStatus } from "../StudentIncident";

export interface PortalSanctionIncidentDTO {
  id: string;
  code: string | null;
  incidentType: string | null;
  occurredAt: string;
  location: string | null;
  status: StudentIncidentStatus;
  severityLevel: string | null;
  role: string | null;
  parentsNotifiedAt: string | null;
}
