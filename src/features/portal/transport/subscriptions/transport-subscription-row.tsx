import { formatCurrency, formatShortDate } from "@/lib/format";
import type { TransportSubscription } from "@/utils/types/TransportSubscription";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { TransportSubscriptionStatusPill } from "./transport-subscription-status-pill";

type TransportSubscriptionRowProps = {
  subscription: TransportSubscription;
  onPress?: (subscription: TransportSubscription) => void;
};

function TransportSubscriptionRowComponent({
  subscription,
  onPress,
}: TransportSubscriptionRowProps) {
  const amount =
    subscription.overrideAmount ?? subscription.pricingPlan?.baseAmount ?? null;

  return (
    <Pressable
      onPress={() => onPress?.(subscription)}
      className="mx-4 mt-3 px-4 py-3 rounded-xl border border-gray-200 bg-white"
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className="flex-1 text-sm font-medium text-black"
          numberOfLines={1}
        >
          {subscription.shift?.name ?? "Vacation"}
        </Text>
        <TransportSubscriptionStatusPill status={subscription.status} />
      </View>

      <View className="flex-row items-baseline justify-between gap-3 mt-2">
        <Text className="text-xs text-gray-400">
          {formatShortDate(subscription.startDate)} →{" "}
          {formatShortDate(subscription.endDate)}
        </Text>
        {amount !== null && (
          <Text className="text-sm font-semibold text-black">
            {formatCurrency(
              amount,
              subscription.pricingPlan?.currency ?? "USD",
            )}
          </Text>
        )}
      </View>

      <Text className="text-xs text-gray-400 mt-1">
        Date abonnement : {formatShortDate(subscription.requestedAt)}
      </Text>
    </Pressable>
  );
}

export const TransportSubscriptionRow = memo(TransportSubscriptionRowComponent);
