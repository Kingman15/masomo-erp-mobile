import { DonutChart } from "@/components/ui/donut-chart";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatCurrency, formatNumber } from "@/lib/format";
import { FinanceBlock, FinanceSummary } from "@/utils/types/PortalStudentDashboard";
import { ActivityIndicator, Text, View } from "react-native";

function FinanceBlockRow({ block }: { block: FinanceBlock }) {
  const colors = useThemeColors();
  const paidRate = Math.max(0, Math.min(100, block.paidRate));

  return (
    <View className="flex-row items-center gap-4 py-2">
      <DonutChart
        size={64}
        strokeWidth={8}
        segments={[
          { value: paidRate, color: "#16A34A" },
          { value: 100 - paidRate, color: colors.muted },
        ]}
        centerLabel={`${formatNumber(paidRate)}%`}
      />
      <View className="flex-1">
        <Text className="text-sm text-foreground">
          {formatCurrency(block.totalPaid, block.currency)} /{" "}
          {formatCurrency(block.totalDue, block.currency)}
        </Text>
        <Text className="text-xs text-faint mt-0.5">
          {formatCurrency(block.remaining, block.currency)} restant
        </Text>
      </View>
    </View>
  );
}

function FinanceGroup({ title, blocks }: { title: string; blocks: FinanceBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <View>
      <Text className="text-xs font-semibold text-muted-foreground">{title}</Text>
      {blocks.map((block) => (
        <FinanceBlockRow key={block.currency} block={block} />
      ))}
    </View>
  );
}

type DashboardFinanceSectionProps = {
  finance: FinanceSummary | undefined;
  loading: boolean;
};

export function DashboardFinanceSection({ finance, loading }: DashboardFinanceSectionProps) {
  if (loading || !finance) {
    return (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    );
  }

  if (finance.schoolFees.length === 0 && finance.transport.length === 0) {
    return (
      <Text className="text-sm text-faint py-2.5">
        Aucune information financière disponible.
      </Text>
    );
  }

  return (
    <View className="gap-2">
      <FinanceGroup title="Frais scolaires" blocks={finance.schoolFees} />
      <FinanceGroup title="Transport" blocks={finance.transport} />
    </View>
  );
}
