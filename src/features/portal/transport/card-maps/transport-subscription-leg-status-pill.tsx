import type { TransportSubscriptionLegStatus } from "@/utils/types/TransportSubscriptionLeg";
import { Text, View } from "react-native";
import { TRANSPORT_SUBSCRIPTION_LEG_STATUS_LABEL_MAP } from "./transport-subscription-leg-status";

const STATUS_CONFIG: Record<TransportSubscriptionLegStatus, { bg: string; fg: string }> = {
  pending: { bg: "bg-amber-100", fg: "text-amber-700" },
  active: { bg: "bg-green-100", fg: "text-green-700" },
  suspended: { bg: "bg-red-100", fg: "text-red-700" },
  cancelled: { bg: "bg-gray-100", fg: "text-gray-600" },
  expired: { bg: "bg-gray-100", fg: "text-gray-600" },
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
