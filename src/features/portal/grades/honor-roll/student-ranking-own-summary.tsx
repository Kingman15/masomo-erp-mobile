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
    <View className="flex-row flex-wrap items-center gap-4 p-4 border border-border rounded-xl bg-card">
      <View className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-800 items-center justify-center shrink-0">
        <Text className="text-lg font-semibold text-blue-600">
          {formatPosition(ranking.position)}
        </Text>
      </View>

      <View className="gap-0.5">
        <Text className="text-sm font-medium text-foreground">
          {ranking.studentName}
        </Text>
        <Text className="text-sm text-muted-foreground">
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
      <Text className="text-xs text-faint">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}
