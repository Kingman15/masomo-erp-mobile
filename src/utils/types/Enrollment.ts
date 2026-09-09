import { Student } from "./Student";

export interface Enrollment {
  id: string;
  studentId: string | null;
  student: Student | null;
}
