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
  open: { bg: "bg-blue-100 dark:bg-blue-900/40", fg: "text-blue-700 dark:text-blue-300" },
  under_review: { bg: "bg-amber-100 dark:bg-amber-900/40", fg: "text-amber-700 dark:text-amber-300" },
  escalated: { bg: "bg-red-100 dark:bg-red-900/40", fg: "text-red-700 dark:text-red-300" },
  resolved: { bg: "bg-green-100 dark:bg-green-900/40", fg: "text-green-700 dark:text-green-300" },
  closed: { bg: "bg-border", fg: "text-gray-600 dark:text-zinc-400" },
};

type IncidentStatusPillProps = {
  status: StudentIncidentStatus | null;
};

export function IncidentStatusPill({ status }: IncidentStatusPillProps) {
  if (!status || !(status in STATUS_CONFIG)) {
    return (
      <View className="px-2.5 py-1 rounded-full bg-muted">
        <Text className="text-xs font-medium text-muted-foreground">—</Text>
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
