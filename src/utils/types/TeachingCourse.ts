import { Employee } from "./Employee";
import { FollowCourse } from "./FollowCourse";
import { SchoolClass } from "./SchoolClass";
import { SchoolSpace } from "./SchoolSpace";

export interface TeachingCourse {
  id: string;
  followCourseId: string;
  schoolClassId: string;
  teacherId: string | null;
  classroomId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  comments: string | null;

  // Relations ===

  followCourse: FollowCourse | null;
  schoolClass: SchoolClass | null;
  teacher: Employee | null;
  classroom: SchoolSpace | null;
}
