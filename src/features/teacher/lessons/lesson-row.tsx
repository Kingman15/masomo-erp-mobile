import type { Lesson } from "@/utils/types/Lesson";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

function formatLessonDate(value: Date | string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

type LessonRowProps = {
  lesson: Lesson;
  onPress?: (lesson: Lesson) => void;
};

function LessonRowComponent({ lesson, onPress }: LessonRowProps) {
  const course = lesson.teachingCourse?.followCourse?.course;
  const schoolClass = lesson.teachingCourse?.schoolClass;
  const className = schoolClass?.title ?? schoolClass?.abbreviation ?? null;

  return (
    <Pressable
      onPress={() => onPress?.(lesson)}
      className="px-4 py-3 border-b border-gray-100 bg-white"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-medium text-gray-500 capitalize">
          {formatLessonDate(lesson.lessonDate)}
        </Text>
        <Text className="text-xs text-gray-400">{lesson.timeStr}</Text>
      </View>

      <Text
        className="text-base font-semibold text-black mt-1"
        numberOfLines={1}
      >
        {lesson.subject}
      </Text>

      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-1">
        {course && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="book-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">{course.name}</Text>
          </View>
        )}
        {className && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">{className}</Text>
          </View>
        )}
        {lesson.classroom && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {lesson.classroom.designation}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const LessonRow = memo(LessonRowComponent);
