import { CourseSchedulePeriodShift } from "./CourseSchedulePeriodShift";

export interface CourseSchedulePeriod {
  id: string;
  code: string;
  periodName: string;
  startTime: string;
  endTime: string;
  shiftId: string | null;
  isActive: boolean;
  displayOrder: number;
  comments: string | null;

  // Relations ===

  shift: CourseSchedulePeriodShift | null;

  // Appends ===

  timeStr: string | null;
}
