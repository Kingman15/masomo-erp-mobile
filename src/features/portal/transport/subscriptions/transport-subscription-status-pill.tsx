import type { TransportSubscriptionStatus } from "@/utils/types/TransportSubscription";
import { Text, View } from "react-native";
import { TRANSPORT_SUBSCRIPTION_STATUS_LABEL_MAP } from "./transport-subscription-status";

const STATUS_CONFIG: Record<TransportSubscriptionStatus, { bg: string; fg: string }> = {
  pending: { bg: "bg-amber-100", fg: "text-amber-700" },
  active: { bg: "bg-green-100", fg: "text-green-700" },
  suspended: { bg: "bg-red-100", fg: "text-red-700" },
  cancelled: { bg: "bg-gray-100", fg: "text-gray-600" },
  expired: { bg: "bg-gray-100", fg: "text-gray-600" },
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
      <View className="px-2 py-0.5 rounded-full bg-gray-100">
        <Text className="text-[10px] font-medium text-gray-500">
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
