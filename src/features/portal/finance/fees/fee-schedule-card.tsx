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
    <View className="mx-4 mt-3 px-4 py-3 rounded-xl border border-border bg-card">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm font-medium text-foreground" numberOfLines={1}>
          {schedule.label ?? "Frais"}
        </Text>
        <FeeScheduleStatusPill status={schedule.status} label={schedule.statusLabel} />
      </View>

      <View className="flex-row items-center justify-between mt-1.5">
        <Text className="text-xs text-faint">
          {schedule.amountPaidStr ?? "—"} / {schedule.amountDueStr ?? "—"}
        </Text>
        <Text className="text-xs text-faint">
          Reste {schedule.amountRemainingStr ?? "—"}
        </Text>
      </View>

      <Text className="text-xs text-faint mt-0.5">
        Échéance : {formatShortDate(schedule.dueDate)}
      </Text>
    </View>
  );
}

export const FeeScheduleCard = memo(FeeScheduleCardComponent);
