import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import type { ScheduleSlotItem } from "./schedule-days";

function shiftStyle(shiftName: string | null) {
  const key = shiftName?.trim().toLowerCase() ?? "";
  if (key.includes("matin")) {
    return { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-800 dark:text-amber-200" };
  }
  if (key.includes("midi") || key.includes("soir")) {
    return { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-800 dark:text-blue-200" };
  }
  return { bg: "bg-muted", text: "text-gray-600 dark:text-zinc-400" };
}

type ScheduleSlotRowProps = {
  item: ScheduleSlotItem;
  isFirst?: boolean;
};

export function ScheduleSlotRow({ item, isFirst }: ScheduleSlotRowProps) {
  const colors = useThemeColors();
  const timeRange =
    item.period.timeStr ?? `${item.period.startTime} - ${item.period.endTime}`;
  const shift = shiftStyle(item.shiftName);

  return (
    <View className={`px-4 py-4 ${isFirst ? "" : "border-t border-divider"}`}>
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="time-outline" size={14} color={colors.foregroundSecondary} />
          <Text className="text-sm font-semibold text-foreground-secondary">{timeRange}</Text>
        </View>
        {item.shiftName && (
          <View className={`px-2.5 py-1 rounded-full ${shift.bg}`}>
            <Text className={`text-[10px] font-bold uppercase tracking-wide ${shift.text}`}>
              {item.shiftName}
            </Text>
          </View>
        )}
      </View>

      <Text className="text-lg font-bold text-foreground">{item.courseLabel}</Text>
    </View>
  );
}
