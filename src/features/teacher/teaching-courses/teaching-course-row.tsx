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
  const course = teachingCourse.followCourse?.course;
  const schoolClass = teachingCourse.schoolClass;
  const className = schoolClass?.title ?? schoolClass?.abbreviation ?? null;

  return (
    <Pressable
      onPress={() => onPress?.(teachingCourse)}
      className="px-4 py-3 border-b border-gray-100 bg-white"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-medium text-gray-500">
          {className ?? ""}
        </Text>
        <Text
          className={`text-xs font-medium ${
            teachingCourse.isActive ? "text-green-600" : "text-gray-400"
          }`}
        >
          {teachingCourse.isActive ? "Actif" : "Inactif"}
        </Text>
      </View>

      <Text
        className="text-base font-semibold text-black mt-1"
        numberOfLines={1}
      >
        {course?.name ?? "Cours"}
      </Text>

      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-1">
        {teachingCourse.classroom && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {teachingCourse.classroom.designation}
            </Text>
          </View>
        )}
        {(teachingCourse.startDate || teachingCourse.endDate) && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">
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
            <Ionicons name="pricetag-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {teachingCourse.followCourse.courseTypeStr}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const TeachingCourseRow = memo(TeachingCourseRowComponent);
