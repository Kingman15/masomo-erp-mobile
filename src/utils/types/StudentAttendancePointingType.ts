export type StudentAttendancePointingTypeCategory = "present" | "absent" | "other";

export interface StudentAttendancePointingType {
  id: string;
  code: string | null;
  label: string | null;
  description: string | null;
  category: StudentAttendancePointingTypeCategory | null;
  countsAsPresent: boolean | null;
  color: string | null;
  requiresJustification: boolean | null;
  isActive: boolean | null;
  displayOrder: number | null;
  comments: string | null;
}
