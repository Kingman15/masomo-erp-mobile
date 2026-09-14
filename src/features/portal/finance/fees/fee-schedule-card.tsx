import { formatShortDate } from "@/lib/format";
import type { FeeScheduleDTO } from "@/utils/types/objects/FeeScheduleDTO";
import { memo } from "react";
import { Text, View } from "react-native";
import { FeeScheduleStatusPill } from "./fee-schedule-status-pill";

type FeeScheduleCardProps = {
  schedule: FeeScheduleDTO;
};

function FeeScheduleCardComponent({ schedule }: FeeScheduleCardProps) {
  return (
    <View className="mx-4 mt-3 px-4 py-3 rounded-xl border border-gray-200 bg-white">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm font-medium text-black" numberOfLines={1}>
          {schedule.label ?? "Frais"}
        </Text>
        <FeeScheduleStatusPill status={schedule.status} label={schedule.statusLabel} />
      </View>

      <View className="flex-row items-center justify-between mt-1.5">
        <Text className="text-xs text-gray-400">
          {schedule.amountPaidStr ?? "—"} / {schedule.amountDueStr ?? "—"}
        </Text>
        <Text className="text-xs text-gray-400">
          Reste {schedule.amountRemainingStr ?? "—"}
        </Text>
      </View>

      <Text className="text-xs text-gray-400 mt-0.5">
        Échéance : {formatShortDate(schedule.dueDate)}
      </Text>
    </View>
  );
}

export const FeeScheduleCard = memo(FeeScheduleCardComponent);
