import { useThemeColors } from "@/hooks/use-theme-colors";
import type { TeachingCourse } from "@/utils/types/TeachingCourse";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

function formatDate(value: Date | string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type TeachingCourseRowProps = {
  teachingCourse: TeachingCourse;
  onPress?: (teachingCourse: TeachingCourse) => void;
};

function TeachingCourseRowComponent({
  teachingCourse,
  onPress,
}: TeachingCourseRowProps) {
  const colors = useThemeColors();
  const course = teachingCourse.followCourse?.course;
  const schoolClass = teachingCourse.schoolClass;
  const className = schoolClass?.title ?? schoolClass?.abbreviation ?? null;

  return (
    <Pressable
      onPress={() => onPress?.(teachingCourse)}
      className="px-4 py-3 border-b border-divider bg-card"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-medium text-muted-foreground">
          {className ?? ""}
        </Text>
        <Text
          className={`text-xs font-medium ${
            teachingCourse.isActive ? "text-green-600" : "text-faint"
          }`}
        >
          {teachingCourse.isActive ? "Actif" : "Inactif"}
        </Text>
      </View>

      <Text
        className="text-base font-semibold text-foreground mt-1"
        numberOfLines={1}
      >
        {course?.name ?? "Cours"}
      </Text>

      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-1">
        {teachingCourse.classroom && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              {teachingCourse.classroom.designation}
            </Text>
          </View>
        )}
        {(teachingCourse.startDate || teachingCourse.endDate) && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              {teachingCourse.startDate
                ? formatDate(teachingCourse.startDate)
                : "—"}
              {" - "}
              {teachingCourse.endDate
                ? formatDate(teachingCourse.endDate)
                : "—"}
            </Text>
          </View>
        )}
        {teachingCourse.followCourse?.courseTypeStr && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="pricetag-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              {teachingCourse.followCourse.courseTypeStr}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const TeachingCourseRow = memo(TeachingCourseRowComponent);
