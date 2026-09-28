import type { TransportInvoicePaymentStatus } from "@/utils/types/objects/TransportSubscriptionFeesSummaryDTO";
import { Text, View } from "react-native";
import { TRANSPORT_INVOICE_PAYMENT_STATUS_LABEL_MAP } from "./transport-subscription-fee-status";

const STATUS_CONFIG: Record<TransportInvoicePaymentStatus, { bg: string; fg: string }> = {
  unpaid: { bg: "bg-amber-100 dark:bg-amber-900/40", fg: "text-amber-700 dark:text-amber-300" },
  partially_paid: { bg: "bg-blue-100 dark:bg-blue-900/40", fg: "text-blue-700 dark:text-blue-300" },
  paid: { bg: "bg-green-100 dark:bg-green-900/40", fg: "text-green-700 dark:text-green-300" },
};

type InvoicePaymentStatusPillProps = {
  status: TransportInvoicePaymentStatus | null;
};

export function InvoicePaymentStatusPill({ status }: InvoicePaymentStatusPillProps) {
  if (!status || !(status in STATUS_CONFIG)) {
    return (
      <View className="px-2 py-0.5 rounded-full bg-muted">
        <Text className="text-[10px] font-medium text-muted-foreground">
          {status ? (TRANSPORT_INVOICE_PAYMENT_STATUS_LABEL_MAP[status] ?? status) : "Non facturé"}
        </Text>
      </View>
    );
  }

  const config = STATUS_CONFIG[status];

  return (
    <View className={`px-2 py-0.5 rounded-full ${config.bg}`}>
      <Text className={`text-[10px] font-medium ${config.fg}`}>
        {TRANSPORT_INVOICE_PAYMENT_STATUS_LABEL_MAP[status]}
      </Text>
    </View>
  );
}
