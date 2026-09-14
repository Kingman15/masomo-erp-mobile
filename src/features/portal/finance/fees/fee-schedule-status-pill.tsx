import type { FeeScheduleStatus } from "@/utils/types/objects/FeeScheduleDTO";
import { Text, View } from "react-native";
import { FEE_SCHEDULE_STATUS_LABEL_MAP } from "./fee-schedule-status";

const STATUS_CONFIG: Record<FeeScheduleStatus, { bg: string; fg: string }> = {
  upcoming: { bg: "bg-blue-100", fg: "text-blue-700" },
  partial: { bg: "bg-amber-100", fg: "text-amber-700" },
  overdue: { bg: "bg-red-100", fg: "text-red-700" },
  paid: { bg: "bg-green-100", fg: "text-green-700" },
};

type FeeScheduleStatusPillProps = {
  status: FeeScheduleStatus | null;
  label?: string | null;
};

export function FeeScheduleStatusPill({ status, label }: FeeScheduleStatusPillProps) {
  if (!status || !(status in STATUS_CONFIG)) {
    return (
      <View className="px-2.5 py-1 rounded-full bg-gray-100">
        <Text className="text-xs font-medium text-gray-500">—</Text>
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
