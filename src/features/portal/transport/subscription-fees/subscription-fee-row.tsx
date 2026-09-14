import { formatCurrency, formatShortDate } from "@/lib/format";
import type { TransportSubscriptionFeeItem } from "@/utils/types/objects/TransportSubscriptionFeesSummaryDTO";
import { memo } from "react";
import { Text, View } from "react-native";
import { InvoicePaymentStatusPill } from "./invoice-payment-status-pill";
import { TRANSPORT_SUBSCRIPTION_FEE_BILLING_PERIOD_LABEL_MAP } from "./transport-subscription-fee-status";

type SubscriptionFeeRowProps = {
  fee: TransportSubscriptionFeeItem;
};

function SubscriptionFeeRowComponent({ fee }: SubscriptionFeeRowProps) {
  const billingPeriodLabel = fee.billingPeriod
    ? TRANSPORT_SUBSCRIPTION_FEE_BILLING_PERIOD_LABEL_MAP[fee.billingPeriod]
    : null;

  return (
    <View className="mx-4 mt-3 px-4 py-3 rounded-xl border border-gray-200 bg-white">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-sm font-medium text-black">
          {formatShortDate(fee.periodStart)} → {formatShortDate(fee.periodEnd)}
        </Text>
        <InvoicePaymentStatusPill status={fee.invoicePaymentStatus} />
      </View>

      <View className="flex-row items-center justify-between mt-1.5">
        <Text className="text-xs text-gray-400">{billingPeriodLabel ?? "—"}</Text>
        <Text className="text-sm font-semibold text-black">
          {formatCurrency(fee.amountNet, fee.currency ?? "USD")}
        </Text>
      </View>
    </View>
  );
}

export const SubscriptionFeeRow = memo(SubscriptionFeeRowComponent);
