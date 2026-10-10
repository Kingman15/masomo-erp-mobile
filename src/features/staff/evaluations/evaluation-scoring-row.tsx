import { useThemeColors } from "@/hooks/use-theme-colors";
import { Text, TextInput, View } from "react-native";

type EvaluationScoringRowProps = {
  studentLabel: string;
  maxScore: number;
  draft: string;
  error: string | null;
  // Avertissement non bloquant (ex. note validée qui repassera en brouillon).
  warning?: string | null;
  onChangeText: (text: string) => void;
  onBlur: () => void;
};

export function EvaluationScoringRow({
  studentLabel,
  maxScore,
  draft,
  error,
  warning,
  onChangeText,
  onBlur,
}: EvaluationScoringRowProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3 px-4 py-2.5 border-b border-divider">
      <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
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
            placeholderTextColor={colors.faint}
            style={{ textAlignVertical: "center", includeFontPadding: false }}
            className={`text-foreground w-20 h-11 border rounded-lg px-2 text-base leading-tight text-center ${
              error ? "border-red-400" : "border-input"
            }`}
          />
          <Text className="text-xs text-faint">/ {maxScore}</Text>
        </View>
        {error ? (
          <Text className="text-[10px] text-red-500 mt-0.5">{error}</Text>
        ) : warning ? (
          <Text className="text-[10px] text-amber-600 mt-0.5">{warning}</Text>
        ) : null}
      </View>
    </View>
  );
}
