import type { TransportInvoicePaymentStatus } from "@/utils/types/objects/TransportSubscriptionFeesSummaryDTO";
import { Text, View } from "react-native";
import { TRANSPORT_INVOICE_PAYMENT_STATUS_LABEL_MAP } from "./transport-subscription-fee-status";

const STATUS_CONFIG: Record<TransportInvoicePaymentStatus, { bg: string; fg: string }> = {
  unpaid: { bg: "bg-amber-100", fg: "text-amber-700" },
  partially_paid: { bg: "bg-blue-100", fg: "text-blue-700" },
  paid: { bg: "bg-green-100", fg: "text-green-700" },
};

type InvoicePaymentStatusPillProps = {
  status: TransportInvoicePaymentStatus | null;
};

export function InvoicePaymentStatusPill({ status }: InvoicePaymentStatusPillProps) {
  if (!status || !(status in STATUS_CONFIG)) {
    return (
      <View className="px-2 py-0.5 rounded-full bg-gray-100">
        <Text className="text-[10px] font-medium text-gray-500">
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
