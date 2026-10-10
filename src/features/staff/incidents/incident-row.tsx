import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatShortDate } from "@/lib/format";
import type { StudentIncident } from "@/utils/types/StudentIncident";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { IncidentStatusPill } from "./incident-status-pill";

type IncidentRowProps = {
  incident: StudentIncident;
  onPress?: (incident: StudentIncident) => void;
};

function involvedStudentsLabel(incident: StudentIncident): string {
  const names = (incident.incidentStudents ?? [])
    .map((incidentStudent) => incidentStudent.student?.fullName)
    .filter((name): name is string => Boolean(name));

  if (names.length > 0) return names.join(", ");
  return incident.mainStudent?.fullDesignation ?? "Élève";
}

function IncidentRowComponent({ incident, onPress }: IncidentRowProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={() => onPress?.(incident)}
      className="px-4 py-3 border-b border-divider bg-card"
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="flex-1 text-base font-semibold text-foreground"
          numberOfLines={1}
        >
          {involvedStudentsLabel(incident)}
        </Text>
        <IncidentStatusPill status={incident.status} />
      </View>

      <Text className="text-sm text-foreground-secondary mt-1" numberOfLines={1}>
        {incident.incidentType?.name ?? "—"}
      </Text>

      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-2">
        {incident.occurredAt && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              {formatShortDate(incident.occurredAt)}
            </Text>
          </View>
        )}
        {incident.location && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">{incident.location}</Text>
          </View>
        )}
        {incident.severityLevel != null && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="alert-circle-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              Gravité {incident.severityLevel}/5
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const IncidentRow = memo(IncidentRowComponent);
