import { StudentIncidentSanctionStatus } from "../StudentIncidentSanction";
import { PortalSanctionIncidentSummaryDTO } from "./PortalSanctionIncidentSummaryDTO";

export interface PortalSanctionDTO {
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
  incident: PortalSanctionIncidentSummaryDTO | null;
}
