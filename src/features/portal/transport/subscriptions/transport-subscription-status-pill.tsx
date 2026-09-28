import type { TransportSubscriptionStatus } from "@/utils/types/TransportSubscription";
import { Text, View } from "react-native";
import { TRANSPORT_SUBSCRIPTION_STATUS_LABEL_MAP } from "./transport-subscription-status";

const STATUS_CONFIG: Record<TransportSubscriptionStatus, { bg: string; fg: string }> = {
  pending: { bg: "bg-amber-100 dark:bg-amber-900/40", fg: "text-amber-700 dark:text-amber-300" },
  active: { bg: "bg-green-100 dark:bg-green-900/40", fg: "text-green-700 dark:text-green-300" },
  suspended: { bg: "bg-red-100 dark:bg-red-900/40", fg: "text-red-700 dark:text-red-300" },
  cancelled: { bg: "bg-muted", fg: "text-gray-600 dark:text-zinc-400" },
  expired: { bg: "bg-muted", fg: "text-gray-600 dark:text-zinc-400" },
};

type TransportSubscriptionStatusPillProps = {
  status: TransportSubscriptionStatus | null;
};

export function TransportSubscriptionStatusPill({
  status,
}: TransportSubscriptionStatusPillProps) {
  if (!status) return null;

  if (!(status in STATUS_CONFIG)) {
    return (
      <View className="px-2 py-0.5 rounded-full bg-muted">
        <Text className="text-[10px] font-medium text-muted-foreground">
          {TRANSPORT_SUBSCRIPTION_STATUS_LABEL_MAP[status] ?? status}
        </Text>
      </View>
    );
  }

  const config = STATUS_CONFIG[status];

  return (
    <View className={`px-2 py-0.5 rounded-full ${config.bg}`}>
      <Text className={`text-[10px] font-medium ${config.fg}`}>
        {TRANSPORT_SUBSCRIPTION_STATUS_LABEL_MAP[status]}
      </Text>
    </View>
  );
}
