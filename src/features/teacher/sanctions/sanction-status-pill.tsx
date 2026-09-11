import type { StudentIncidentSanctionStatus } from "@/utils/types/StudentIncidentSanction";
import { Text, View } from "react-native";

const STATUS_CONFIG: Record<
  StudentIncidentSanctionStatus,
  { label: string; bg: string; fg: string }
> = {
  pending: { label: "En attente", bg: "bg-amber-100", fg: "text-amber-700" },
  active: { label: "Actif", bg: "bg-blue-100", fg: "text-blue-700" },
  completed: {
    label: "Terminé",
    bg: "bg-green-100",
    fg: "text-green-700",
  },
  cancelled: { label: "Annulé", bg: "bg-gray-200", fg: "text-gray-600" },
  appealed: { label: "Fait appel", bg: "bg-red-100", fg: "text-red-700" },
};

type SanctionStatusPillProps = {
  status: StudentIncidentSanctionStatus | null;
};

export function SanctionStatusPill({ status }: SanctionStatusPillProps) {
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
        {config.label}
      </Text>
    </View>
  );
}
