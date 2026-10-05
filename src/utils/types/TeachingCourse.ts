import { FollowCourse } from "./FollowCourse";
import { SchoolClass } from "./SchoolClass";
import { SchoolSpace } from "./SchoolSpace";
import { TeachingCourseTeacher } from "./TeachingCourseTeacher";

export interface TeachingCourse {
  id: string;
  followCourseId: string;
  schoolClassId: string;
  classroomId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  comments: string | null;

  // Relations ===

  followCourse: FollowCourse | null;
  schoolClass: SchoolClass | null;
  // Toutes les affectations du cours, principal en premier
  teachers?: TeachingCourseTeacher[];
  classroom: SchoolSpace | null;
}
