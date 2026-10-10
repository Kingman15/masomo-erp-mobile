import { useThemeColors } from "@/hooks/use-theme-colors";
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
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={() => onPress?.(sanction)}
      className="px-4 py-3 border-b border-divider bg-card"
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="flex-1 text-base font-semibold text-foreground"
          numberOfLines={1}
        >
          {sanction.student?.fullDesignation ?? "Élève"}
        </Text>
        <SanctionStatusPill status={sanction.status} />
      </View>

      <Text className="text-sm text-foreground-secondary mt-1" numberOfLines={1}>
        {sanction.sanctionType?.name ?? "—"}
      </Text>

      {sanction.regulationArticle?.title && (
        <Text className="text-xs text-faint mt-0.5" numberOfLines={1}>
          {sanction.regulationArticle.title}
        </Text>
      )}

      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-2">
        {sanction.incident?.incidentType?.name && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="alert-circle-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              {sanction.incident.incidentType.name}
            </Text>
          </View>
        )}
        {sanction.incident?.occurredAt && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              {formatShortDate(sanction.incident.occurredAt)}
            </Text>
          </View>
        )}
        {(sanction.startsAt || sanction.endsAt) && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
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
