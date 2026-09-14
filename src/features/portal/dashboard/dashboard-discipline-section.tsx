import { DisciplineSummary } from "@/utils/types/PortalStudentDashboard";
import { ActivityIndicator, Text, View } from "react-native";
import { StatBox } from "./stat-box";

type DashboardDisciplineSectionProps = {
  discipline: DisciplineSummary | undefined;
  loading: boolean;
};

export function DashboardDisciplineSection({
  discipline,
  loading,
}: DashboardDisciplineSectionProps) {
  if (loading || !discipline) {
    return (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    );
  }

  const { annual, monthly } = discipline;

  return (
    <View className="gap-3">
      <View className="flex-row py-1">
        <StatBox label="Incidents (année)" value={String(annual.incidents)} />
        <StatBox label="Sanctions (année)" value={String(annual.sanctions)} />
        <StatBox
          label="Sanctions actives"
          value={String(annual.activeSanctions)}
          tone={annual.activeSanctions > 0 ? "warning" : "default"}
          align="right"
        />
      </View>

      <View className="border-t border-gray-100 pt-2">
        <Text className="text-xs text-gray-500">
          Ce mois ({monthly.period}) : {monthly.incidents} incident(s),{" "}
          {monthly.sanctions} sanction(s)
          {monthly.delta.incidents !== 0 && (
            <Text
              className={
                monthly.delta.incidents < 0 ? "text-emerald-600" : "text-red-600"
              }
            >
              {" "}
              ({monthly.delta.incidents > 0 ? "+" : ""}
              {monthly.delta.incidents} vs {monthly.comparedTo})
            </Text>
          )}
        </Text>
      </View>
    </View>
  );
}
