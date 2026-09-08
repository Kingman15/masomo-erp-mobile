import { CourseSchedule } from "./CourseSchedule";
import { CourseSchedulePeriod } from "./CourseSchedulePeriod";
import { SchoolSpace } from "./SchoolSpace";
import { TeachingCourse } from "./TeachingCourse";

export interface TeachingSchedule {
  id: string;
  code: string;
  teachingCourseId: string;
  courseScheduleId: string;
  daySchedule: number; // 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
  courseSchedulePeriodId: string;
  schoolSpaceId: string | null;
  isActive: boolean;
  comments: string | null;

  // Relations ===

  teachingCourse: TeachingCourse | null;
  courseSchedule: CourseSchedule | null;
  courseSchedulePeriod: CourseSchedulePeriod | null;
  schoolSpace: SchoolSpace | null;
}
