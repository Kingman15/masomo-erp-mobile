import { Employee } from "./Employee";
import { SchoolSpace } from "./SchoolSpace";
import { TeachingCourse } from "./TeachingCourse";

export interface Lesson {
  id: string;
  code: string;
  fileNo: string;
  subject: string;
  lessonDate: Date;
  startTime: string;
  endTime: string;
  teachingCourseId: string;
  teacherId: string | null;
  classroomId: string | null;
  comments: string | null;

  // Relations ===

  teachingCourse: TeachingCourse | null;
  teacher: Employee | null;
  classroom: SchoolSpace | null;

  // Appends ===

  timeStr: string | null;
  intervalStr: string | null;
}
