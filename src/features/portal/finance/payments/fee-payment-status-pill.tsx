import type { FeePaymentStatus } from "@/utils/types/objects/PortalFeePaymentDTO";
import { Text, View } from "react-native";
import { FEE_PAYMENT_STATUS_LABEL_MAP } from "./fee-payment-status";

const STATUS_CONFIG: Record<FeePaymentStatus, { bg: string; fg: string }> = {
  pending: { bg: "bg-amber-100 dark:bg-amber-900/40", fg: "text-amber-700 dark:text-amber-300" },
  partial: { bg: "bg-blue-100 dark:bg-blue-900/40", fg: "text-blue-700 dark:text-blue-300" },
  paid: { bg: "bg-green-100 dark:bg-green-900/40", fg: "text-green-700 dark:text-green-300" },
};

type FeePaymentStatusPillProps = {
  status: FeePaymentStatus | null;
  label?: string | null;
};

export function FeePaymentStatusPill({ status, label }: FeePaymentStatusPillProps) {
  if (!status || !(status in STATUS_CONFIG)) {
    return (
      <View className="px-2.5 py-1 rounded-full bg-muted">
        <Text className="text-xs font-medium text-muted-foreground">—</Text>
      </View>
    );
  }

  const config = STATUS_CONFIG[status];

  return (
    <View className={`px-2.5 py-1 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.fg}`}>
        {label ?? FEE_PAYMENT_STATUS_LABEL_MAP[status]}
      </Text>
    </View>
  );
}
