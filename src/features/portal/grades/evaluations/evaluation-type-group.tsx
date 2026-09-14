import { PortalTeachingCourseEvaluationDTO } from "@/utils/types/objects/PortalTeachingCourseEvaluationDTO";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { EvaluationRow } from "./evaluation-row";

type EvaluationTypeGroupProps = {
  type: string;
  evaluations: PortalTeachingCourseEvaluationDTO[];
  onPressEvaluation: (evaluation: PortalTeachingCourseEvaluationDTO) => void;
};

export function EvaluationTypeGroup({
  type,
  evaluations,
  onPressEvaluation,
}: EvaluationTypeGroupProps) {
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
              {evaluations.length}
            </Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={18}
          color="#9CA3AF"
        />
      </Pressable>

      {expanded &&
        evaluations.map((evaluation) => (
          <EvaluationRow
            key={evaluation.id}
            evaluation={evaluation}
            onPress={onPressEvaluation}
          />
        ))}
    </View>
  );
}
