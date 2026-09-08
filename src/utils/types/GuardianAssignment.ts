import { Guardian } from "./Guardian";
import { Student } from "./Student";

export interface GuardianAssignment {
  id: string;
  code: string;
  guardianId: string;
  studentId: string;
  relationship: string;
  assignmentDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  isPrimaryGuardian: boolean;
  isLegalGuardian: boolean;
  description: string | null;
  notes: string | null;

  // ---

  guardian: Guardian | null;
  student: Student | null;
}
