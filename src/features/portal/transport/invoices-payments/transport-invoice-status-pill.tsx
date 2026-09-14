import type { TransportInvoiceStatus } from "@/utils/types/objects/PortalTransportInvoiceDTO";
import { Text, View } from "react-native";
import { TRANSPORT_INVOICE_STATUS_LABEL_MAP } from "./transport-invoice-status";

const STATUS_CONFIG: Record<TransportInvoiceStatus, { bg: string; fg: string }> = {
  draft: { bg: "bg-gray-100", fg: "text-gray-600" },
  issued: { bg: "bg-blue-100", fg: "text-blue-700" },
  partially_paid: { bg: "bg-amber-100", fg: "text-amber-700" },
  paid: { bg: "bg-green-100", fg: "text-green-700" },
  cancelled: { bg: "bg-red-100", fg: "text-red-700" },
};

type TransportInvoiceStatusPillProps = {
  status: TransportInvoiceStatus | null;
};

export function TransportInvoiceStatusPill({ status }: TransportInvoiceStatusPillProps) {
  if (!status) return null;

  if (!(status in STATUS_CONFIG)) {
    return (
      <View className="px-2 py-0.5 rounded-full bg-gray-100">
        <Text className="text-[10px] font-medium text-gray-500">{status}</Text>
      </View>
    );
  }

  const config = STATUS_CONFIG[status];

  return (
    <View className={`px-2 py-0.5 rounded-full ${config.bg}`}>
      <Text className={`text-[10px] font-medium ${config.fg}`}>
        {TRANSPORT_INVOICE_STATUS_LABEL_MAP[status]}
      </Text>
    </View>
  );
}
