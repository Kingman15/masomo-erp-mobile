import { AttendanceRecordFormScreen } from "@/features/staff/attendance/attendance-record-form-screen";
import { useLocalSearchParams } from "expo-router";

export default function TeacherAttendanceEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AttendanceRecordFormScreen recordId={id} />;
}
