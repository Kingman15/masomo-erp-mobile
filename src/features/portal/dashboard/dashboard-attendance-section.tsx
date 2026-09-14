import { DonutChart } from "@/components/ui/donut-chart";
import { formatNumber } from "@/lib/format";
import { DashboardAttendance } from "@/utils/types/PortalStudentDashboard";
import { ActivityIndicator, Text, View } from "react-native";
import { StatBox } from "./stat-box";

type DashboardAttendanceSectionProps = {
  attendance: DashboardAttendance | undefined;
  loading: boolean;
};

export function DashboardAttendanceSection({
  attendance,
  loading,
}: DashboardAttendanceSectionProps) {
  if (loading || !attendance) {
    return (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    );
  }

  const { annual } = attendance;
  const presenceRate = annual.presenceRate ?? 0;

  return (
    <View className="flex-row items-center gap-4">
      <DonutChart
        segments={[
          { value: presenceRate, color: "#16A34A" },
          { value: 100 - presenceRate, color: "#FEE2E2" },
        ]}
        centerLabel={annual.presenceRate !== null ? `${formatNumber(annual.presenceRate)}%` : "—"}
        centerSubLabel="présence"
      />

      <View className="flex-1 gap-3">
        <Text className="text-xs text-gray-400">
          Taux annuel · {annual.sessionsRecorded} session(s)
        </Text>
        <View className="flex-row">
          <StatBox label="Absences justifiées" value={String(annual.absences.justified)} />
          <StatBox
            label="Absences non justifiées"
            value={String(annual.absences.unjustified)}
            tone={annual.absences.unjustified > 0 ? "warning" : "default"}
          />
        </View>
      </View>
    </View>
  );
}
