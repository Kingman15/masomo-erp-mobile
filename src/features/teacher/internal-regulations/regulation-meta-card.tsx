import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatShortDate } from "@/lib/format";
import type { StudentInternalRegulation } from "@/utils/types/StudentInternalRegulation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

type RegulationMetaCardProps = {
  regulation: StudentInternalRegulation;
};

export function RegulationMetaCard({ regulation }: RegulationMetaCardProps) {
  const colors = useThemeColors();
  const hasDateRange = regulation.effectiveFrom || regulation.effectiveUntil;

  return (
    <View className="mx-4 mt-3 p-4 border border-border rounded-xl bg-card">
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={2}>
          {regulation.title ?? "—"}
        </Text>
        <View
          className={`px-2 py-0.5 rounded-full ${regulation.isActive ? "bg-green-100 dark:bg-green-900/40" : "bg-muted"}`}
        >
          <Text
            className={`text-xs font-medium ${regulation.isActive ? "text-green-700 dark:text-green-300" : "text-muted-foreground"}`}
          >
            {regulation.isActive ? "Actif" : "Inactif"}
          </Text>
        </View>
      </View>

      {regulation.code && (
        <Text className="text-xs text-faint mt-0.5">{regulation.code}</Text>
      )}

      {regulation.preamble && (
        <Text className="text-sm text-gray-600 dark:text-zinc-400 mt-2">{regulation.preamble}</Text>
      )}

      <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
        {regulation.targetStr && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              {regulation.targetTypeStr ? `${regulation.targetTypeStr} · ` : ""}
              {regulation.targetStr}
            </Text>
          </View>
        )}
        {regulation.schoolYear?.title && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="pricetag-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              Année {regulation.schoolYear.title}
            </Text>
          </View>
        )}
        {hasDateRange && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              {formatShortDate(regulation.effectiveFrom)}
              {" - "}
              {formatShortDate(regulation.effectiveUntil)}
            </Text>
          </View>
        )}
      </View>

      {regulation.description && (
        <View className="mt-3 pt-3 border-t border-divider">
          <Text className="text-xs text-faint mb-1">Description</Text>
          <Text className="text-sm text-gray-600 dark:text-zinc-400">{regulation.description}</Text>
        </View>
      )}
    </View>
  );
}
