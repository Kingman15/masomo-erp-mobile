import { formatShortDate } from "@/lib/format";
import type { StudentIncidentSanction } from "@/utils/types/StudentIncidentSanction";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { SanctionStatusPill } from "./sanction-status-pill";

type SanctionRowProps = {
  sanction: StudentIncidentSanction;
  onPress?: (sanction: StudentIncidentSanction) => void;
};

function SanctionRowComponent({ sanction, onPress }: SanctionRowProps) {
  return (
    <Pressable
      onPress={() => onPress?.(sanction)}
      className="px-4 py-3 border-b border-gray-100 bg-white"
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="flex-1 text-base font-semibold text-black"
          numberOfLines={1}
        >
          {sanction.student?.fullDesignation ?? "Élève"}
        </Text>
        <SanctionStatusPill status={sanction.status} />
      </View>

      <Text className="text-sm text-gray-700 mt-1" numberOfLines={1}>
        {sanction.sanctionType?.name ?? "—"}
      </Text>

      {sanction.regulationArticle?.title && (
        <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
          {sanction.regulationArticle.title}
        </Text>
      )}

      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-2">
        {sanction.incident?.incidentType?.name && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="alert-circle-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {sanction.incident.incidentType.name}
            </Text>
          </View>
        )}
        {sanction.incident?.occurredAt && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {formatShortDate(sanction.incident.occurredAt)}
            </Text>
          </View>
        )}
        {(sanction.startsAt || sanction.endsAt) && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {formatShortDate(sanction.startsAt)}
              {" - "}
              {formatShortDate(sanction.endsAt)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const SanctionRow = memo(SanctionRowComponent);
