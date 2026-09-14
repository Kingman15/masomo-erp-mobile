import { formatCurrency, formatShortDate } from "@/lib/format";
import type { TransportSubscriptionFeesSummaryDTO } from "@/utils/types/objects/TransportSubscriptionFeesSummaryDTO";
import { Text, View } from "react-native";
import { SubscriptionStatusPill } from "./subscription-status-pill";
import {
  TRANSPORT_SUBSCRIPTION_FEE_BILLING_PERIOD_LABEL_MAP,
  TRANSPORT_SUBSCRIPTION_LEG_DIRECTION_LABEL_MAP,
} from "./transport-subscription-fee-status";

type SubscriptionPlansSummaryCardProps = {
  subscription: NonNullable<TransportSubscriptionFeesSummaryDTO["subscription"]>;
};

export function SubscriptionPlansSummaryCard({
  subscription,
}: SubscriptionPlansSummaryCardProps) {
  return (
    <View className="mx-4 mt-3 px-4 py-3 rounded-xl border border-gray-200 bg-white">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-sm font-medium text-black">
          {formatShortDate(subscription.startDate)} → {formatShortDate(subscription.endDate)}
        </Text>
        <SubscriptionStatusPill status={subscription.status} />
      </View>

      <View className="gap-2 mt-3">
        {subscription.plans.map((plan, index) => {
          const scopeLabel =
            plan.scope === "leg" && plan.legDirection
              ? TRANSPORT_SUBSCRIPTION_LEG_DIRECTION_LABEL_MAP[plan.legDirection]
              : "Abonnement";
          const billingPeriodLabel = plan.billingPeriod
            ? TRANSPORT_SUBSCRIPTION_FEE_BILLING_PERIOD_LABEL_MAP[plan.billingPeriod]
            : null;

          return (
            <View key={index} className="rounded-lg border border-gray-100 px-3 py-2">
              <Text className="text-xs text-gray-400">{scopeLabel}</Text>
              <Text className="text-sm font-medium text-black" numberOfLines={1}>
                {plan.name}
              </Text>
              <View className="flex-row items-center justify-between mt-0.5">
                <Text className="text-xs text-gray-400">{billingPeriodLabel ?? "—"}</Text>
                <Text className="text-sm font-semibold text-black">
                  {formatCurrency(plan.amount, plan.currency)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
