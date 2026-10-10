import type { StudentIncidentSanctionStatus } from "@/utils/types/StudentIncidentSanction";
import { Text, View } from "react-native";

export const SANCTION_STATUS_CONFIG: Record<
  StudentIncidentSanctionStatus,
  { label: string; bg: string; fg: string }
> = {
  pending: { label: "En attente", bg: "bg-amber-100 dark:bg-amber-900/40", fg: "text-amber-700 dark:text-amber-300" },
  active: { label: "Actif", bg: "bg-blue-100 dark:bg-blue-900/40", fg: "text-blue-700 dark:text-blue-300" },
  completed: {
    label: "Terminé",
    bg: "bg-green-100 dark:bg-green-900/40",
    fg: "text-green-700 dark:text-green-300",
  },
  cancelled: { label: "Annulé", bg: "bg-border", fg: "text-gray-600 dark:text-zinc-400" },
  appealed: { label: "Fait appel", bg: "bg-red-100 dark:bg-red-900/40", fg: "text-red-700 dark:text-red-300" },
};

type SanctionStatusPillProps = {
  status: StudentIncidentSanctionStatus | null;
};

export function SanctionStatusPill({ status }: SanctionStatusPillProps) {
  if (!status || !(status in SANCTION_STATUS_CONFIG)) {
    return (
      <View className="px-2.5 py-1 rounded-full bg-muted">
        <Text className="text-xs font-medium text-muted-foreground">—</Text>
      </View>
    );
  }

  const config = SANCTION_STATUS_CONFIG[status];

  return (
    <View className={`px-2.5 py-1 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.fg}`}>
        {config.label}
      </Text>
    </View>
  );
}
