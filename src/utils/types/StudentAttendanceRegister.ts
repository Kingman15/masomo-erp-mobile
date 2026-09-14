import { SchoolYear } from "./SchoolYear";

export interface StudentAttendanceRegister {
  id: string;
  code: string | null;
  schoolYearId: string | null;
  title: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  status: "open" | "closed" | "archived" | null;
  description: string | null;
  notes: string | null;

  // Relations ===

  schoolYear: SchoolYear | null;
}
