import { Lesson } from "./Lesson";
import { StudentAttendanceRegister } from "./StudentAttendanceRegister";

export interface StudentAttendanceSession {
  id: string;
  code: string | null;
  registerId: string | null;
  title: string | null;
  attendanceDate: string | null;
  arrivalTime: string | null;
  departureTime: string | null;
  lessonId: string | null;
  status: "open" | "closed" | "archived" | null;
  description: string | null;
  notes: string | null;

  // ---

  register: StudentAttendanceRegister | null;
  lesson: Lesson | null;
}
