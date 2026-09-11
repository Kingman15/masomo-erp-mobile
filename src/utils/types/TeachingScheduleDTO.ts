import { Course } from "./Course";
import { CourseSchedulePeriod } from "./CourseSchedulePeriod";
import { SchoolClass } from "./SchoolClass";

export interface TeachingScheduleDTO {
  // #region formatted

  schoolClassStr: string;
  courseSchedulePeriodStr: string;

  shiftName: string | null;

  mondayCourseStr: string | null;
  tuesdayCourseStr: string | null;
  wednesdayCourseStr: string | null;
  thursdayCourseStr: string | null;
  fridayCourseStr: string | null;
  saturdayCourseStr: string | null;
  sundayCourseStr: string | null;

  // #endregion

  // #region raw

  schoolClassId: string;
  courseSchedulePeriodId: string;

  mondayCourseId: string | null;
  tuesdayCourseId: string | null;
  wednesdayCourseId: string | null;
  thursdayCourseId: string | null;
  fridayCourseId: string | null;
  saturdayCourseId: string | null;
  sundayCourseId: string | null;

  // #endregion

  // #region relations

  schoolClass: SchoolClass | null;
  courseSchedulePeriod: CourseSchedulePeriod | null;

  mondayCourse: Course | null;
  tuesdayCourse: Course | null;
  wednesdayCourse: Course | null;
  thursdayCourse: Course | null;
  fridayCourse: Course | null;
  saturdayCourse: Course | null;
  sundayCourse: Course | null;

  // #endregion
}
