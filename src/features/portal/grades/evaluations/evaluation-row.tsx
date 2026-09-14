import { PortalTeachingCourseEvaluationDTO } from "@/utils/types/objects/PortalTeachingCourseEvaluationDTO";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

function formatEvaluationDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type EvaluationRowProps = {
  evaluation: PortalTeachingCourseEvaluationDTO;
  onPress?: (evaluation: PortalTeachingCourseEvaluationDTO) => void;
};

function EvaluationRowComponent({ evaluation, onPress }: EvaluationRowProps) {
  const course = evaluation.course;

  return (
    <Pressable
      onPress={() => onPress?.(evaluation)}
      className="px-4 py-3 border-b border-gray-100 bg-white"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-medium text-gray-500 capitalize">
          {formatEvaluationDate(evaluation.evaluationDate)}
        </Text>
        {evaluation.evaluationType && (
          <Text className="text-xs text-gray-400">
            {evaluation.evaluationType}
          </Text>
        )}
      </View>

      <Text
        className="text-base font-semibold text-black mt-1"
        numberOfLines={1}
      >
        {evaluation.wording ?? evaluation.evaluationType ?? "Évaluation"}
      </Text>

      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-1">
        {course && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="book-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">{course.name}</Text>
          </View>
        )}

        {evaluation.evaluationPeriod?.name && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {evaluation.evaluationPeriod.name}
            </Text>
          </View>
        )}
        {(evaluation.maxScore != null || evaluation.weight != null) && (
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="school-outline" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {evaluation.maxScore != null && (
                <Text className="text-xs text-gray-500">
                  /{evaluation.maxScore}
                </Text>
              )}
              {evaluation.maxScore != null && evaluation.weight != null && (
                <Text className="text-xs text-gray-400"> · </Text>
              )}
              {evaluation.weight != null && (
                <Text className="text-xs text-gray-500">
                  Coef.: {evaluation.weight}
                </Text>
              )}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const EvaluationRow = memo(EvaluationRowComponent);
