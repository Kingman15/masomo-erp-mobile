import type { TransportInvoiceStatus } from "@/utils/types/objects/PortalTransportInvoiceDTO";
import { Text, View } from "react-native";
import { TRANSPORT_INVOICE_STATUS_LABEL_MAP } from "./transport-invoice-status";

const STATUS_CONFIG: Record<TransportInvoiceStatus, { bg: string; fg: string }> = {
  draft: { bg: "bg-muted", fg: "text-gray-600 dark:text-zinc-400" },
  issued: { bg: "bg-blue-100 dark:bg-blue-900/40", fg: "text-blue-700 dark:text-blue-300" },
  partially_paid: { bg: "bg-amber-100 dark:bg-amber-900/40", fg: "text-amber-700 dark:text-amber-300" },
  paid: { bg: "bg-green-100 dark:bg-green-900/40", fg: "text-green-700 dark:text-green-300" },
  cancelled: { bg: "bg-red-100 dark:bg-red-900/40", fg: "text-red-700 dark:text-red-300" },
};

type TransportInvoiceStatusPillProps = {
  status: TransportInvoiceStatus | null;
};

export function TransportInvoiceStatusPill({ status }: TransportInvoiceStatusPillProps) {
  if (!status) return null;

  if (!(status in STATUS_CONFIG)) {
    return (
      <View className="px-2 py-0.5 rounded-full bg-muted">
        <Text className="text-[10px] font-medium text-muted-foreground">{status}</Text>
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
