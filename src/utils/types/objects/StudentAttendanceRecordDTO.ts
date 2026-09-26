import { Enrollment } from "../Enrollment";

export interface StudentAttendanceRecordDTO {
  enrollment: Enrollment;
  isChecked: boolean;
  isPresent: boolean;
  isLate: boolean;
  isPartial: boolean;
  justificationNote: string | null;
}
