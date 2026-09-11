import { Employee } from "./Employee";
import { IncidentStudent } from "./IncidentStudent";
import { IncidentType } from "./IncidentType";
import { SchoolYear } from "./SchoolYear";
import { Student } from "./Student";
import { StudentIncidentSanction } from "./StudentIncidentSanction";

export const STUDENT_INCIDENT_STATUSES = [
  "open",
  "under_review",
  "escalated",
  "resolved",
  "closed",
] as const;

export type StudentIncidentStatus = (typeof STUDENT_INCIDENT_STATUSES)[number];

export interface StudentIncident {
  id: string;
  code: string | null;
  schoolYearId: string | null;
  parentIncidentId: string | null;
  incidentTypeId: string | null;
  mainStudentId: string | null;

  occurredAt: string | null;
  reportedAt: string | null;
  description: string | null;
  location: string | null;
  severityLevel: number | null;
  status: StudentIncidentStatus | null;
  reportedBy: string | null;
  handledBy: string | null;

  temporaryMeasureApplied: boolean;
  temporaryMeasureDescription: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  measuresTaken: string | null;

  psychologicalSupportRequired: boolean;
  psychologicalSupportNotes: string | null;

  parentsNotified: boolean;
  parentsNotifiedAt: string | null;
  parentsNotifiedBy: string | null;

  internalNotes: string | null;

  createdAt: string | null;
  updatedAt: string | null;

  // ---

  schoolYear: SchoolYear | null;
  parentIncident: StudentIncident | null;
  incidentType: IncidentType | null;
  mainStudent: Student | null;
  reportedByEmployee: Employee | null;
  handledByEmployee: Employee | null;
  resolvedByEmployee: Employee | null;
  parentsNotifiedByEmployee: Employee | null;
  incidentStudents: IncidentStudent[];
  sanctions: StudentIncidentSanction[];
}
