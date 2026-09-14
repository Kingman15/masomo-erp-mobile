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
  const [expanded, setExpanded] = useState(true);

  return (
    <View className="border-b border-gray-100">
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        className="flex-row items-center justify-between px-4 py-3 bg-gray-50"
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-semibold text-gray-700">{type}</Text>
          <View className="min-w-[20px] h-5 px-1.5 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-xs font-medium text-gray-600">
              {grades.length}
            </Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={18}
          color="#9CA3AF"
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
