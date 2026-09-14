import type { FeePaymentDerogationStatus } from "@/utils/types/objects/PortalFeePaymentDerogationDTO";
import { Text, View } from "react-native";
import { FEE_PAYMENT_DEROGATION_STATUS_LABEL_MAP } from "./fee-payment-derogation-status";

const STATUS_CONFIG: Record<FeePaymentDerogationStatus, { bg: string; fg: string }> = {
  pending: { bg: "bg-amber-100", fg: "text-amber-700" },
  approved: { bg: "bg-green-100", fg: "text-green-700" },
  rejected: { bg: "bg-red-100", fg: "text-red-700" },
};

type FeePaymentDerogationStatusPillProps = {
  status: FeePaymentDerogationStatus | null;
  label?: string | null;
};

export function FeePaymentDerogationStatusPill({
  status,
  label,
}: FeePaymentDerogationStatusPillProps) {
  if (!status || !(status in STATUS_CONFIG)) {
    return (
      <View className="px-2.5 py-1 rounded-full bg-gray-100">
        <Text className="text-xs font-medium text-gray-500">{label ?? "—"}</Text>
      </View>
    );
  }

  const config = STATUS_CONFIG[status];

  return (
    <View className={`px-2.5 py-1 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.fg}`}>
        {label ?? FEE_PAYMENT_DEROGATION_STATUS_LABEL_MAP[status]}
      </Text>
    </View>
  );
}
