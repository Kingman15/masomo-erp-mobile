import { formatShortDate } from "@/lib/format";
import { PortalGradeDTO } from "@/utils/types/objects/PortalGradeDTO";
import { memo } from "react";
import { Text, View } from "react-native";

type GradeRowProps = {
  grade: PortalGradeDTO;
};

function GradeRowComponent({ grade }: GradeRowProps) {
  const label = grade.wording ?? grade.evaluationType ?? grade.evaluationPeriod.name;

  return (
    <View className="px-3 py-2.5 border border-gray-200 rounded-lg mb-2 bg-white">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-black" numberOfLines={1}>
          {grade.course.shortName ?? grade.course.name}
        </Text>
        <Text className="text-sm font-bold text-black">
          {grade.score}/{grade.maxScore}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mt-0.5">
        <Text className="flex-1 text-xs text-gray-500" numberOfLines={1}>
          {label}
          {!grade.countsTowardsFinal && " (hors moyenne)"}
        </Text>
        <Text className="text-xs text-gray-400">
          {formatShortDate(grade.evaluationDate)}
        </Text>
      </View>

      <Text className="text-xs text-gray-400 mt-0.5">
        {grade.evaluationPeriod.name}
      </Text>
    </View>
  );
}

export const GradeRow = memo(GradeRowComponent);
