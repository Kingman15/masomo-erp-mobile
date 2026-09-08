import { SchoolYear } from "./SchoolYear";

export interface CourseSchedule {
  id: string;
  code: string;
  schoolYearId: string;
  scheduleDate: Date | null;
  title: string | null;
  isActive: boolean;
  description: string | null;
  comments: string | null;

  // Relations ===

  schoolYear: SchoolYear | null;
}
