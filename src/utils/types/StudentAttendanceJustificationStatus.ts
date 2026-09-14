export interface StudentAttendanceJustificationStatus {
  id: string;
  code: string | null;
  label: string | null;
  description: string | null;
  isJustified: boolean | null;
  isFinal: boolean | null;
  isActive: boolean | null;
  displayOrder: number | null;
  comments: string | null;
}
