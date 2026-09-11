import { formatShortDate } from "@/lib/format";
import type { StudentInternalRegulation } from "@/utils/types/StudentInternalRegulation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

type RegulationMetaCardProps = {
  regulation: StudentInternalRegulation;
};

export function RegulationMetaCard({ regulation }: RegulationMetaCardProps) {
  const hasDateRange = regulation.effectiveFrom || regulation.effectiveUntil;

  return (
    <View className="mx-4 mt-3 p-4 border border-gray-200 rounded-xl bg-white">
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-base font-semibold text-black" numberOfLines={2}>
          {regulation.title ?? "—"}
        </Text>
        <View
          className={`px-2 py-0.5 rounded-full ${regulation.isActive ? "bg-green-100" : "bg-gray-100"}`}
        >
          <Text
            className={`text-xs font-medium ${regulation.isActive ? "text-green-700" : "text-gray-500"}`}
          >
            {regulation.isActive ? "Actif" : "Inactif"}
          </Text>
        </View>
      </View>

      {regulation.code && (
        <Text className="text-xs text-gray-400 mt-0.5">{regulation.code}</Text>
      )}

      {regulation.preamble && (
        <Text className="text-sm text-gray-600 mt-2">{regulation.preamble}</Text>
      )}

      <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
        {regulation.targetStr && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {regulation.targetTypeStr ? `${regulation.targetTypeStr} · ` : ""}
              {regulation.targetStr}
            </Text>
          </View>
        )}
        {regulation.schoolYear?.title && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="pricetag-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              Année {regulation.schoolYear.title}
            </Text>
          </View>
        )}
        {hasDateRange && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {formatShortDate(regulation.effectiveFrom)}
              {" - "}
              {formatShortDate(regulation.effectiveUntil)}
            </Text>
          </View>
        )}
      </View>

      {regulation.description && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <Text className="text-xs text-gray-400 mb-1">Description</Text>
          <Text className="text-sm text-gray-600">{regulation.description}</Text>
        </View>
      )}
    </View>
  );
}
