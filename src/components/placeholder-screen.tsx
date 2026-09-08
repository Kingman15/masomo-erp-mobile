import { Text, View } from "react-native";

type PlaceholderScreenProps = {
  title: string;
  description?: string;
};

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 bg-white">
      <Text className="text-2xl font-medium mb-2 text-center">{title}</Text>
      <Text className="text-sm text-gray-500 text-center">
        {description ?? "Écran à venir."}
      </Text>
    </View>
  );
}
