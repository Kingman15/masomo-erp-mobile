import { Employee } from "./Employee";
import { RegulationArticle } from "./RegulationArticle";
import { SanctionType } from "./SanctionType";
import { Student } from "./Student";
import { StudentIncident } from "./StudentIncident";

export const STUDENT_INCIDENT_SANCTION_STATUSES = [
  "pending",
  "active",
  "completed",
  "cancelled",
  "appealed",
] as const;

export type StudentIncidentSanctionStatus =
  (typeof STUDENT_INCIDENT_SANCTION_STATUSES)[number];

export interface StudentIncidentSanction {
  id: string;
  code: string | null;
  status: StudentIncidentSanctionStatus | null;
  startsAt: string | null;
  endsAt: string | null;
  justification: string | null;
  notes: string | null;
  decidedAt: string | null;
  isAppealed: boolean;
  appealedAt: string | null;
  appealNotes: string | null;
  parentsNotified: boolean;
  parentsNotifiedAt: string | null;

  student: Student | null;
  sanctionType: SanctionType | null;
  regulationArticle: RegulationArticle | null;
  decidedByEmployee: Employee | null;
  parentsNotifiedByEmployee: Employee | null;
  incident: StudentIncident | null;
}
