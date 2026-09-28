import type { FeeScheduleSummaryDTO } from "@/utils/types/objects/FeeScheduleSummaryDTO";
import { ActivityIndicator, Text, View } from "react-native";
import { FeeScheduleStatusPill } from "./fee-schedule-status-pill";

type FeeScheduleSummaryCardProps = {
  summary: FeeScheduleSummaryDTO | undefined;
  isLoading: boolean;
};

export function FeeScheduleSummaryCard({ summary, isLoading }: FeeScheduleSummaryCardProps) {
  if (isLoading) {
    return (
      <View className="mx-4 mt-3 h-20 rounded-xl border border-border bg-card items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!summary) return null;

  return (
    <View className="mx-4 mt-3 px-4 py-1 rounded-xl border border-border bg-card">
      <View className="flex-row items-center justify-between py-2.5 border-b border-divider">
        <Text className="text-sm font-medium text-foreground-secondary">Statut</Text>
        <FeeScheduleStatusPill status={summary.status} label={summary.statusLabel} />
      </View>

      <SummaryRow label="Dû" value={summary.totalAmountDueStr} />
      <SummaryRow label="Payé" value={summary.totalAmountPaidStr} />
      <SummaryRow
        label="Restant"
        value={summary.totalAmountRemainingStr}
        emphasize={summary.status !== "paid"}
      />
      <SummaryRow
        label="Échéances"
        value={String(summary.installmentsCount)}
        last
      />
    </View>
  );
}

function SummaryRow({
  label,
  value,
  emphasize = false,
  last = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between py-2.5 ${
        last ? "" : "border-b border-divider"
      }`}
    >
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text
        className={`text-sm font-semibold ${emphasize ? "text-red-600" : "text-foreground"}`}
      >
        {value}
      </Text>
    </View>
  );
}
