import { formatNumber } from "@/lib/format";
import { CourseAverageDTO } from "@/utils/types/objects/CourseAverageDTO";
import { memo } from "react";
import { Text, View } from "react-native";

type CourseAverageRowProps = {
  courseAverage: CourseAverageDTO;
};

function CourseAverageRowComponent({ courseAverage }: CourseAverageRowProps) {
  return (
    <View className="px-3 py-2.5 border border-gray-200 rounded-lg mb-2 bg-white gap-1">
      <Text className="text-sm font-medium text-black" numberOfLines={1}>
        {courseAverage.courseName}
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-black">
          {formatNumber(courseAverage.totalPoints)} /{" "}
          {formatNumber(courseAverage.totalEffectiveMax)}
        </Text>
        <Text className="text-sm font-semibold text-black">
          {formatNumber(courseAverage.effectivePercentage)}%
        </Text>
      </View>
    </View>
  );
}

export const CourseAverageRow = memo(CourseAverageRowComponent);
