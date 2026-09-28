import { useThemeColors } from "@/hooks/use-theme-colors";
import { PortalGradeDTO } from "@/utils/types/objects/PortalGradeDTO";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { GradeRow } from "./grade-row";

type GradeTypeGroupProps = {
  type: string;
  grades: PortalGradeDTO[];
};

export function GradeTypeGroup({ type, grades }: GradeTypeGroupProps) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(true);

  return (
    <View className="border-b border-divider">
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        className="flex-row items-center justify-between px-4 py-3 bg-subtle"
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-semibold text-foreground-secondary">{type}</Text>
          <View className="min-w-[20px] h-5 px-1.5 rounded-full bg-border items-center justify-center">
            <Text className="text-xs font-medium text-gray-600 dark:text-zinc-400">
              {grades.length}
            </Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={18}
          color={colors.faint}
        />
      </Pressable>

      {expanded && (
        <View className="px-3 pt-2">
          {grades.map((grade) => (
            <GradeRow key={grade.id} grade={grade} />
          ))}
        </View>
      )}
    </View>
  );
}
