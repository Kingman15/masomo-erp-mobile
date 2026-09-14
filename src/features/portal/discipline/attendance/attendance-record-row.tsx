import { StudentAttendanceRecord } from "@/utils/types/StudentAttendanceRecord";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { getAttendanceBadgeInfo } from "./get-attendance-badge-info";

type AttendanceRecordRowProps = {
  record: StudentAttendanceRecord;
  onPress?: (record: StudentAttendanceRecord) => void;
};

function AttendanceRecordRowComponent({
  record,
  onPress,
}: AttendanceRecordRowProps) {
  const badge = getAttendanceBadgeInfo(record);
  const isAbsent = record.pointingType?.code === "absent";

  return (
    <Pressable
      onPress={() => onPress?.(record)}
      className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white"
    >
      <View
        className="h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: badge.dotColor }}
      />

      <View className="flex-1">
        <Text className="text-sm font-medium text-black">
          {isAbsent
            ? badge.label
            : `${record.entryTime ?? "—"}${
                record.exitTime ? ` / ${record.exitTime}` : ""
              }`}
        </Text>
        {record.pointingType?.label && (
          <Text className="text-xs text-gray-400 mt-0.5">
            {record.pointingType.label}
          </Text>
        )}
      </View>

      <View
        className="rounded-full px-2 py-0.5"
        style={{ backgroundColor: badge.bgColor }}
      >
        <Text className="text-xs font-medium" style={{ color: badge.textColor }}>
          {badge.label}
        </Text>
      </View>
    </Pressable>
  );
}

export const AttendanceRecordRow = memo(AttendanceRecordRowComponent);
