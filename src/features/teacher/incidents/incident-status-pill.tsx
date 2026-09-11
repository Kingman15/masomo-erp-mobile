import type { StudentIncidentStatus } from "@/utils/types/StudentIncident";
import { Text, View } from "react-native";

export const INCIDENT_STATUS_LABELS: Record<StudentIncidentStatus, string> = {
  open: "Ouvert",
  under_review: "En cours d'examen",
  escalated: "Escaladé",
  resolved: "Résolu",
  closed: "Clôturé",
};

const STATUS_CONFIG: Record<
  StudentIncidentStatus,
  { bg: string; fg: string }
> = {
  open: { bg: "bg-blue-100", fg: "text-blue-700" },
  under_review: { bg: "bg-amber-100", fg: "text-amber-700" },
  escalated: { bg: "bg-red-100", fg: "text-red-700" },
  resolved: { bg: "bg-green-100", fg: "text-green-700" },
  closed: { bg: "bg-gray-200", fg: "text-gray-600" },
};

type IncidentStatusPillProps = {
  status: StudentIncidentStatus | null;
};

export function IncidentStatusPill({ status }: IncidentStatusPillProps) {
  if (!status || !(status in STATUS_CONFIG)) {
    return (
      <View className="px-2.5 py-1 rounded-full bg-gray-100">
        <Text className="text-xs font-medium text-gray-500">—</Text>
      </View>
    );
  }

  const config = STATUS_CONFIG[status];

  return (
    <View className={`px-2.5 py-1 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.fg}`}>
        {INCIDENT_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
