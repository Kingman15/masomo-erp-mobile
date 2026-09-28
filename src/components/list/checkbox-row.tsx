import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text } from "react-native";

type CheckboxRowProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export function CheckboxRow({
  label,
  value,
  onChange,
  disabled,
}: CheckboxRowProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={() => !disabled && onChange(!value)}
      className="flex-row items-center gap-3 mb-4"
    >
      <Ionicons
        name={value ? "checkbox" : "square-outline"}
        size={22}
        color={value ? (disabled ? colors.faint : colors.foreground) : colors.faint}
      />
      <Text className={`text-sm ${disabled ? "text-faint" : "text-foreground-secondary"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
