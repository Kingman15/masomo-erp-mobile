import { formatShortDate } from "@/lib/format";
import { PortalGradeDTO } from "@/utils/types/objects/PortalGradeDTO";
import { memo } from "react";
import { Text, View } from "react-native";

type GradeRowProps = {
  grade: PortalGradeDTO;
};

function GradeRowComponent({ grade }: GradeRowProps) {
  const label = grade.wording ?? grade.evaluationType ?? grade.schoolPeriod.name;

  return (
    <View className="px-3 py-2.5 border border-border rounded-lg mb-2 bg-card">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {grade.course.shortName ?? grade.course.name}
        </Text>
        <Text className="text-sm font-bold text-foreground">
          {grade.score}/{grade.maxScore}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mt-0.5">
        <Text className="flex-1 text-xs text-muted-foreground" numberOfLines={1}>
          {label}
          {!grade.countsTowardsFinal && " (hors moyenne)"}
        </Text>
        <Text className="text-xs text-faint">
          {formatShortDate(grade.evaluationDate)}
        </Text>
      </View>

      <Text className="text-xs text-faint mt-0.5">
        {grade.schoolPeriod.name}
      </Text>
    </View>
  );
}

export const GradeRow = memo(GradeRowComponent);
