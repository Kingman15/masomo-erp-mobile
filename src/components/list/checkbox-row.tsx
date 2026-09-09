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
  return (
    <Pressable
      onPress={() => !disabled && onChange(!value)}
      className="flex-row items-center gap-3 mb-4"
    >
      <Ionicons
        name={value ? "checkbox" : "square-outline"}
        size={22}
        color={value ? (disabled ? "#9CA3AF" : "#000000") : "#9CA3AF"}
      />
      <Text className={`text-sm ${disabled ? "text-gray-400" : "text-gray-700"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
