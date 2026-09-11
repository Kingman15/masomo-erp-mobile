import { Student } from "./Student";
import { StudentIncident } from "./StudentIncident";

export const INCIDENT_STUDENT_ROLES = [
  "perpetrator",
  "victim",
  "witness",
  "involved",
  "accused",
  "other",
] as const;

export type IncidentStudentRole = (typeof INCIDENT_STUDENT_ROLES)[number];

export const INCIDENT_STUDENT_ROLE_LABELS: Record<IncidentStudentRole, string> = {
  perpetrator: "Auteur",
  victim: "Victime",
  witness: "Témoin",
  involved: "Impliqué",
  accused: "Accusé",
  other: "Autre",
};

export interface IncidentStudent {
  id: string;
  code: string | null;
  incidentId: string | null;
  studentId: string | null;
  role: IncidentStudentRole | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;

  incident: StudentIncident | null;
  student: Student | null;
}
