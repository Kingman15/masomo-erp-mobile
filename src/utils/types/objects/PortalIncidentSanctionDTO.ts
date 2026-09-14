import { StudentIncidentSanctionStatus } from "../StudentIncidentSanction";

export interface PortalIncidentSanctionDTO {
  id: string;
  sanctionType: string | null;
  regulationArticle: string | null;
  decidedAt: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: StudentIncidentSanctionStatus;
  justification: string | null;
  isAppealed: boolean;
  appealNotes: string | null;
}
