import { getAttendanceBadgeInfo } from "@/features/portal/discipline/attendance/get-attendance-badge-info";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { StudentAttendanceRecord } from "@/utils/types/StudentAttendanceRecord";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import {
  getEnrollmentLabel,
  getSchoolClassLabel,
  toHoursMinutes,
} from "./attendance-labels";

type AttendanceRecordRowProps = {
  record: StudentAttendanceRecord;
  onPress?: (record: StudentAttendanceRecord) => void;
};

function AttendanceRecordRowComponent({
  record,
  onPress,
}: AttendanceRecordRowProps) {
  const colors = useThemeColors();
  const badge = getAttendanceBadgeInfo(record);
  const schoolClass = record.enrollment?.schoolClass;
  const entryTime = toHoursMinutes(record.entryTime);
  const exitTime = toHoursMinutes(record.exitTime);

  return (
    <Pressable
      onPress={() => onPress?.(record)}
      className="px-4 py-3 border-b border-divider bg-card"
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className="flex-1 text-base font-semibold text-foreground"
          numberOfLines={1}
        >
          {getEnrollmentLabel(record.enrollment)}
        </Text>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: badge.bgColor }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: badge.textColor }}
          >
            {badge.label}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-1">
        {record.pointingType?.label && (
          <View className="flex-row items-center gap-1">
            <View
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: record.pointingType.color ?? badge.dotColor,
              }}
            />
            <Text className="text-xs text-muted-foreground">
              {record.pointingType.label}
            </Text>
          </View>
        )}
        {schoolClass && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              {getSchoolClassLabel(schoolClass)}
            </Text>
          </View>
        )}
        {entryTime && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              {entryTime}
              {exitTime ? ` - ${exitTime}` : ""}
            </Text>
          </View>
        )}
        {record.justificationStatus?.label && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="document-text-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              {record.justificationStatus.label}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const AttendanceRecordRow = memo(AttendanceRecordRowComponent);
