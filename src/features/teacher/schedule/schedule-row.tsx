import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import type { ScheduleRowItem } from "./schedule-days";

function shiftStyle(shiftName: string | null) {
  const key = shiftName?.trim().toLowerCase() ?? "";
  if (key.includes("matin")) {
    return { bg: "bg-amber-100", text: "text-amber-800" };
  }
  if (key.includes("midi") || key.includes("soir")) {
    return { bg: "bg-blue-100", text: "text-blue-800" };
  }
  return { bg: "bg-gray-100", text: "text-gray-600" };
}

type ScheduleRowProps = {
  item: ScheduleRowItem;
  isFirst?: boolean;
};

export function ScheduleRow({ item, isFirst }: ScheduleRowProps) {
  const timeRange =
    item.period.timeStr ?? `${item.period.startTime} - ${item.period.endTime}`;
  const shift = shiftStyle(item.shiftName);

  return (
    <View className={`px-4 py-4 ${isFirst ? "" : "border-t border-gray-100"}`}>
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="time-outline" size={14} color="#4B5563" />
          <Text className="text-sm font-semibold text-gray-700">
            {timeRange}
          </Text>
        </View>
        {item.shiftName && (
          <View className={`px-2.5 py-1 rounded-full ${shift.bg}`}>
            <Text
              className={`text-[10px] font-bold uppercase tracking-wide ${shift.text}`}
            >
              {item.shiftName}
            </Text>
          </View>
        )}
      </View>

      <Text className="text-lg font-bold text-black">{item.course.name}</Text>

      <View className="flex-row items-center gap-1 mt-1">
        <Ionicons name="people-outline" size={13} color="#9CA3AF" />
        <Text className="text-xs text-gray-500">
          {item.schoolClass.title ?? item.schoolClass.abbreviation ?? "Classe"}
        </Text>
      </View>
    </View>
  );
}
