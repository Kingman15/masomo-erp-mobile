import { StudentAttendanceRecord } from "@/utils/types/StudentAttendanceRecord";
import { Text, View } from "react-native";
import { AttendanceRecordRow } from "./attendance-record-row";

type AttendanceRecordDateGroupProps = {
  date: string;
  records: StudentAttendanceRecord[];
  onPressRecord?: (record: StudentAttendanceRecord) => void;
};

function formatGroupDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const formatted = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function AttendanceRecordDateGroup({
  date,
  records,
  onPressRecord,
}: AttendanceRecordDateGroupProps) {
  return (
    <View className="border-b border-gray-100">
      <View className="px-4 py-2 bg-gray-50">
        <Text className="text-xs font-semibold text-gray-600 capitalize">
          {formatGroupDate(date)}
        </Text>
      </View>
      {records.map((record) => (
        <AttendanceRecordRow
          key={record.id}
          record={record}
          onPress={onPressRecord}
        />
      ))}
    </View>
  );
}
