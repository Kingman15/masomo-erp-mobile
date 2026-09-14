import { Employee } from "./Employee";
import { Enrollment } from "./Enrollment";
import { StudentAttendanceJustificationStatus } from "./StudentAttendanceJustificationStatus";
import { StudentAttendancePointingChannel } from "./StudentAttendancePointingChannel";
import { StudentAttendancePointingType } from "./StudentAttendancePointingType";
import { StudentAttendanceSession } from "./StudentAttendanceSession";

export interface StudentAttendanceRecord {
  id: string;
  code: string | null;
  sessionId: string | null;
  enrollmentId: string | null;
  entryTime: string | null;
  entryPointedAt: Date | string | null;
  exitTime: string | null;
  exitPointedAt: Date | string | null;
  pointedById: string | null;
  pointingTypeId: string | null;
  isLate: boolean | null;
  isPartial: boolean | null;
  justificationStatusId: string | null;
  justificationNote: string | null;
  justificationDate: Date | string | null;
  pointingDate: string | null;
  pointingChannelId: string | null;
  location: string | null;
  note: string | null;

  // Relations ===

  session: StudentAttendanceSession | null;
  enrollment: Enrollment | null;
  pointedByEmployee: Employee | null;
  pointingType: StudentAttendancePointingType | null;
  justificationStatus: StudentAttendanceJustificationStatus | null;
  pointingChannel: StudentAttendancePointingChannel | null;
}
