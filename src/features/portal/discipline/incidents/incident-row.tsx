import { IncidentStatusPill } from "@/features/teacher/incidents/incident-status-pill";
import { formatShortDate } from "@/lib/format";
import { PortalIncidentDTO } from "@/utils/types/objects/PortalIncidentDTO";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

type IncidentRowProps = {
  incident: PortalIncidentDTO;
  onPress?: (incident: PortalIncidentDTO) => void;
};

function IncidentRowComponent({ incident, onPress }: IncidentRowProps) {
  return (
    <Pressable
      onPress={() => onPress?.(incident)}
      className="px-4 py-3 border-b border-gray-100 bg-white"
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm font-medium text-black" numberOfLines={1}>
          {incident.incidentType ?? "Incident"}
        </Text>
        <IncidentStatusPill status={incident.status} />
      </View>

      {incident.role && (
        <Text className="text-xs text-gray-400 mt-0.5">
          Rôle : {incident.role}
        </Text>
      )}

      <Text className="text-xs text-gray-400 mt-0.5">
        {formatShortDate(incident.occurredAt)}
        {incident.location ? ` · ${incident.location}` : ""}
      </Text>
    </Pressable>
  );
}

export const IncidentRow = memo(IncidentRowComponent);
