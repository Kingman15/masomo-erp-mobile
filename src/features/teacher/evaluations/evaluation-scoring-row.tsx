import { Text, TextInput, View } from "react-native";

type EvaluationScoringRowProps = {
  studentLabel: string;
  maxScore: number;
  draft: string;
  error: string | null;
  onChangeText: (text: string) => void;
  onBlur: () => void;
};

export function EvaluationScoringRow({
  studentLabel,
  maxScore,
  draft,
  error,
  onChangeText,
  onBlur,
}: EvaluationScoringRowProps) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-2.5 border-b border-gray-100">
      <Text className="flex-1 text-sm text-black" numberOfLines={1}>
        {studentLabel}
      </Text>

      <View className="items-end">
        <View className="flex-row items-center gap-1">
          <TextInput
            value={draft}
            onChangeText={onChangeText}
            onBlur={onBlur}
            keyboardType="decimal-pad"
            placeholder="—"
            placeholderTextColor="#9CA3AF"
            className={`w-16 h-9 border rounded-lg px-2 text-center ${
              error ? "border-red-400" : "border-gray-300"
            }`}
          />
          <Text className="text-xs text-gray-400">/ {maxScore}</Text>
        </View>
        {error && (
          <Text className="text-[10px] text-red-500 mt-0.5">{error}</Text>
        )}
      </View>
    </View>
  );
}
