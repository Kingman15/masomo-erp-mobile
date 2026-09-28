import { formatCurrency } from "@/lib/format";
import { Text, View } from "react-native";

type SubscriptionFeesTotalsCardProps = {
  totalFees: number;
  totalAmountNet: string;
  currency?: string;
};

export function SubscriptionFeesTotalsCard({
  totalFees,
  totalAmountNet,
  currency,
}: SubscriptionFeesTotalsCardProps) {
  return (
    <View className="mx-4 mt-3 px-4 py-1 rounded-xl border border-border bg-card">
      <SummaryRow label="Échéances" value={String(totalFees)} />
      <SummaryRow
        label="Total net"
        value={formatCurrency(totalAmountNet, currency)}
        last
      />
    </View>
  );
}

function SummaryRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between py-2.5 ${
        last ? "" : "border-b border-divider"
      }`}
    >
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}
