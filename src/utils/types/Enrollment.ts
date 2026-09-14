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
  student: Student;
  schoolYear: SchoolYear;
  schoolClass: SchoolClass | null;
}
