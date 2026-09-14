import { Text, View } from "react-native";

type StatBoxProps = {
  label: string;
  value: string;
  tone?: "default" | "warning";
  align?: "left" | "right";
};

export function StatBox({ label, value, tone = "default", align = "left" }: StatBoxProps) {
  return (
    <View className={`flex-1 ${align === "right" ? "items-end" : "items-start"}`}>
      <Text
        className={`text-lg font-semibold ${
          tone === "warning" ? "text-red-600" : "text-black"
        }`}
      >
        {value}
      </Text>
      <Text className="text-xs text-gray-400">{label}</Text>
    </View>
  );
}
