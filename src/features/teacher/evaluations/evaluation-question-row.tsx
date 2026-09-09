import type { TeachingCourseEvaluationQuestionFormValues } from "@/utils/schemas/teaching-course-evaluation-schema";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

const QUESTION_TYPE_LABELS: Record<string, string> = {
  text: "Texte",
};

type EvaluationQuestionRowProps = {
  question: TeachingCourseEvaluationQuestionFormValues;
  errorMessage?: string;
  onPress: () => void;
  onDelete: () => void;
  onRestore: () => void;
};

export function EvaluationQuestionRow({
  question,
  errorMessage,
  onPress,
  onDelete,
  onRestore,
}: EvaluationQuestionRowProps) {
  const isDeleted = Boolean(question.isDeleted);

  return (
    <Pressable
      onPress={isDeleted ? undefined : onPress}
      className={`flex-row items-center gap-3 px-3 py-3 border rounded-lg mb-2 ${
        isDeleted ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-white"
      }`}
    >
      <View
        className={`items-center justify-center w-8 h-8 rounded-full ${
          isDeleted ? "bg-gray-200" : "bg-gray-100"
        }`}
      >
        <Text className="text-xs font-semibold text-gray-500">
          {question.questionNo}
        </Text>
      </View>

      <View className="flex-1">
        <Text className="text-xs text-gray-400 mb-0.5">
          {QUESTION_TYPE_LABELS[question.questionType] ?? question.questionType}
          {" · "}
          {question.weight} pt{question.weight > 1 ? "s" : ""}
        </Text>
        <Text
          className={`text-sm ${
            isDeleted ? "text-gray-400 line-through" : "text-black"
          }`}
          numberOfLines={2}
        >
          {question.questionText || "(Question sans texte)"}
        </Text>
        {errorMessage && (
          <Text className="text-xs text-red-500 mt-1">{errorMessage}</Text>
        )}
      </View>

      {isDeleted ? (
        <Pressable onPress={onRestore} hitSlop={8} className="p-1">
          <Ionicons name="arrow-undo-outline" size={18} color="#6B7280" />
        </Pressable>
      ) : (
        <Pressable onPress={onDelete} hitSlop={8} className="p-1">
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </Pressable>
      )}
    </Pressable>
  );
}
