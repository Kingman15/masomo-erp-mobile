import { formatNumber } from "@/lib/format";
import { StudentRankingDTO } from "@/utils/types/objects/StudentRankingDTO";
import { memo } from "react";
import { Text, View } from "react-native";
import { formatPosition } from "./format-position";

type StudentRankingRowProps = {
  ranking: StudentRankingDTO;
};

function StudentRankingRowComponent({ ranking }: StudentRankingRowProps) {
  return (
    <View className="flex-row items-center gap-3 px-3 py-2.5 border border-gray-200 rounded-lg mb-2 bg-white">
      <View className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 items-center justify-center shrink-0">
        <Text className="text-xs font-semibold text-gray-500">
          {formatPosition(ranking.position)}
        </Text>
      </View>

      <View className="flex-1 gap-1">
        <Text className="text-sm font-medium text-black" numberOfLines={1}>
          {ranking.studentName}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-black">
            {formatNumber(ranking.totalPoints)} /{" "}
            {formatNumber(ranking.totalEffectiveMax)}
          </Text>
          <Text className="text-sm font-semibold text-black">
            {formatNumber(ranking.effectivePercentage)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

export const StudentRankingRow = memo(StudentRankingRowComponent);
