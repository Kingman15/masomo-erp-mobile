import { formatShortDate } from "@/lib/format";
import type { PortalTransportScheduleDTO } from "@/utils/types/objects/PortalTransportScheduleDTO";
import { memo } from "react";
import { Text, View } from "react-native";
import { BUS_SCHEDULE_PERIOD_TYPE_LABEL_MAP } from "./transport-schedule-labels";

type TransportScheduleRowProps = {
  schedule: PortalTransportScheduleDTO;
};

function TransportScheduleRowComponent({ schedule }: TransportScheduleRowProps) {
  const periodTypeLabel = schedule.periodType
    ? (BUS_SCHEDULE_PERIOD_TYPE_LABEL_MAP[schedule.periodType] ?? schedule.periodType)
    : "—";
  const hasValidityRange = Boolean(schedule.validFrom || schedule.validUntil);

  return (
    <View className="mx-4 mt-3 px-4 py-3 rounded-xl border border-border bg-card">
      <View className="flex-row items-center justify-between gap-2">
        <View className="px-2 py-0.5 rounded-full bg-muted">
          <Text className="text-[10px] font-medium text-gray-600 dark:text-zinc-400">
            {schedule.directionLabel ?? "—"}
          </Text>
        </View>
        <Text className="text-sm font-semibold text-foreground">{schedule.time ?? "—"}</Text>
      </View>

      <View className="flex-row items-center justify-between mt-1.5">
        <Text className="text-xs text-faint">{schedule.operatingDaysLabel ?? "—"}</Text>
        <Text className="text-xs text-faint">{periodTypeLabel}</Text>
      </View>

      {hasValidityRange && (
        <Text className="text-xs text-faint mt-1">
          {formatShortDate(schedule.validFrom)} → {formatShortDate(schedule.validUntil)}
        </Text>
      )}
    </View>
  );
}

export const TransportScheduleRow = memo(TransportScheduleRowComponent);
