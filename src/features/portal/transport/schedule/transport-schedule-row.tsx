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
    <View className="mx-4 mt-3 px-4 py-3 rounded-xl border border-gray-200 bg-white">
      <View className="flex-row items-center justify-between gap-2">
        <View className="px-2 py-0.5 rounded-full bg-gray-100">
          <Text className="text-[10px] font-medium text-gray-600">
            {schedule.directionLabel ?? "—"}
          </Text>
        </View>
        <Text className="text-sm font-semibold text-black">{schedule.time ?? "—"}</Text>
      </View>

      <View className="flex-row items-center justify-between mt-1.5">
        <Text className="text-xs text-gray-400">{schedule.operatingDaysLabel ?? "—"}</Text>
        <Text className="text-xs text-gray-400">{periodTypeLabel}</Text>
      </View>

      {hasValidityRange && (
        <Text className="text-xs text-gray-400 mt-1">
          {formatShortDate(schedule.validFrom)} → {formatShortDate(schedule.validUntil)}
        </Text>
      )}
    </View>
  );
}

export const TransportScheduleRow = memo(TransportScheduleRowComponent);
