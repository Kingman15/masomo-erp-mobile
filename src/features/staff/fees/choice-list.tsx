import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

type ChoiceOption<T extends string> = { id: T; label: string; description?: string | null };

type ChoiceListProps<T extends string> = {
  options: ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

// Choix exclusif (boutons radio) : à distinguer visuellement des boutons d'action du formulaire.
export function ChoiceList<T extends string>({ options, value, onChange }: ChoiceListProps<T>) {
  const colors = useThemeColors();

  return (
    <View className="gap-2">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            className={`flex-row items-center gap-3 px-3 py-3 rounded-lg border bg-card ${
              selected ? "border-foreground" : "border-input"
            }`}
          >
            <Ionicons
              name={selected ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={selected ? colors.foreground : colors.mutedForeground}
            />
            <View className="flex-1">
              <Text className={`text-sm text-foreground ${selected ? "font-semibold" : ""}`}>{option.label}</Text>
              {option.description ? (
                <Text className="text-xs text-muted-foreground mt-0.5">{option.description}</Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
