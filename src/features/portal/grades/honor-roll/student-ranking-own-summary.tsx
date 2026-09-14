import { formatNumber } from "@/lib/format";
import { StudentRankingDTO } from "@/utils/types/objects/StudentRankingDTO";
import { Text, View } from "react-native";
import { formatPosition } from "./format-position";

type StudentRankingOwnSummaryProps = {
  ranking: StudentRankingDTO;
  totalStudents: number;
};

export function StudentRankingOwnSummary({
  ranking,
  totalStudents,
}: StudentRankingOwnSummaryProps) {
  return (
    <View className="flex-row flex-wrap items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white">
      <View className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 items-center justify-center shrink-0">
        <Text className="text-lg font-semibold text-blue-600">
          {formatPosition(ranking.position)}
        </Text>
      </View>

      <View className="gap-0.5">
        <Text className="text-sm font-medium text-black">
          {ranking.studentName}
        </Text>
        <Text className="text-sm text-gray-500">
          {formatPosition(ranking.position)} sur {totalStudents} élève
          {totalStudents > 1 ? "s" : ""}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-6 ml-auto">
        <SummaryItem
          label="Points obtenus"
          value={`${formatNumber(ranking.totalPoints)} / ${formatNumber(
            ranking.totalEffectiveMax,
          )}`}
        />
        <SummaryItem
          label="Pourcentage"
          value={`${formatNumber(ranking.effectivePercentage)}%`}
        />
      </View>
    </View>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-0.5">
      <Text className="text-xs text-gray-400">{label}</Text>
      <Text className="text-sm font-semibold text-black">{value}</Text>
    </View>
  );
}
