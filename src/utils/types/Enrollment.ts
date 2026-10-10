import { Guardian } from "./Guardian";
import { SchoolClass } from "./SchoolClass";
import { SchoolYear } from "./SchoolYear";
import { Student } from "./Student";

export interface Enrollment {
  id: string;
  code: string | null;
  studentId: string;
  schoolYearId: string;
  schoolClassId: string | null;
  status: string | null;
  enrollmentNumber: string | null;
  enrollmentDate: string | null;
  guardianId?: string | null;
  enrollmentType?: string | null;
  withdrawnAt?: string | null;
  withdrawalReason?: string | null;

  student: Student;
  schoolYear: SchoolYear;
  schoolClass: SchoolClass | null;
  guardian?: Guardian | null;
}

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  active: "Actif",
  suspended: "Suspendu",
  expelled: "Exclu",
  graduated: "Diplômé",
  transferred: "Transféré",
};
