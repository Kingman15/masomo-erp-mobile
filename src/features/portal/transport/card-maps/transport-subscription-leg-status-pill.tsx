import type { TransportSubscriptionLegStatus } from "@/utils/types/TransportSubscriptionLeg";
import { Text, View } from "react-native";
import { TRANSPORT_SUBSCRIPTION_LEG_STATUS_LABEL_MAP } from "./transport-subscription-leg-status";

const STATUS_CONFIG: Record<TransportSubscriptionLegStatus, { bg: string; fg: string }> = {
  pending: { bg: "bg-amber-100 dark:bg-amber-900/40", fg: "text-amber-700 dark:text-amber-300" },
  active: { bg: "bg-green-100 dark:bg-green-900/40", fg: "text-green-700 dark:text-green-300" },
  suspended: { bg: "bg-red-100 dark:bg-red-900/40", fg: "text-red-700 dark:text-red-300" },
  cancelled: { bg: "bg-muted", fg: "text-gray-600 dark:text-zinc-400" },
  expired: { bg: "bg-muted", fg: "text-gray-600 dark:text-zinc-400" },
};

type TransportSubscriptionLegStatusPillProps = {
  status: TransportSubscriptionLegStatus | null;
};

export function TransportSubscriptionLegStatusPill({
  status,
}: TransportSubscriptionLegStatusPillProps) {
  if (!status) return null;

  const config = STATUS_CONFIG[status];

  return (
    <View className={`px-2 py-0.5 rounded-full ${config.bg}`}>
      <Text className={`text-[10px] font-medium ${config.fg}`}>
        {TRANSPORT_SUBSCRIPTION_LEG_STATUS_LABEL_MAP[status]}
      </Text>
    </View>
  );
}
