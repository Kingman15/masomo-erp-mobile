import type { FeePaymentDerogation } from "@/utils/types/FeePayment";
import { Text, View } from "react-native";

type Status = NonNullable<FeePaymentDerogation["status"]>;

export const DEROGATION_STATUS_LABELS: Record<Status, string> = {
  pending: "En attente",
  approved: "Accordée",
  rejected: "Refusée",
};

const STATUS_STYLES: Record<Status, { bg: string; fg: string }> = {
  pending: { bg: "bg-amber-100 dark:bg-amber-900/40", fg: "text-amber-700 dark:text-amber-300" },
  approved: { bg: "bg-green-100 dark:bg-green-900/40", fg: "text-green-700 dark:text-green-300" },
  rejected: { bg: "bg-red-100 dark:bg-red-900/40", fg: "text-red-700 dark:text-red-300" },
};

export function DerogationStatusPill({ status }: { status: FeePaymentDerogation["status"] }) {
  if (!status) return null;
  const style = STATUS_STYLES[status];

  return (
    <View className={`px-2.5 py-1 rounded-full ${style.bg}`}>
      <Text className={`text-xs font-medium ${style.fg}`}>{DEROGATION_STATUS_LABELS[status]}</Text>
    </View>
  );
}
