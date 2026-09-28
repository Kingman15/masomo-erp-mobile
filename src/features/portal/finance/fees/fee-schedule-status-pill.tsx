import type { FeeScheduleStatus } from "@/utils/types/objects/FeeScheduleDTO";
import { Text, View } from "react-native";
import { FEE_SCHEDULE_STATUS_LABEL_MAP } from "./fee-schedule-status";

const STATUS_CONFIG: Record<FeeScheduleStatus, { bg: string; fg: string }> = {
  upcoming: { bg: "bg-blue-100 dark:bg-blue-900/40", fg: "text-blue-700 dark:text-blue-300" },
  partial: { bg: "bg-amber-100 dark:bg-amber-900/40", fg: "text-amber-700 dark:text-amber-300" },
  overdue: { bg: "bg-red-100 dark:bg-red-900/40", fg: "text-red-700 dark:text-red-300" },
  paid: { bg: "bg-green-100 dark:bg-green-900/40", fg: "text-green-700 dark:text-green-300" },
};

type FeeScheduleStatusPillProps = {
  status: FeeScheduleStatus | null;
  label?: string | null;
};

export function FeeScheduleStatusPill({ status, label }: FeeScheduleStatusPillProps) {
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
        {label ?? FEE_SCHEDULE_STATUS_LABEL_MAP[status]}
      </Text>
    </View>
  );
}
