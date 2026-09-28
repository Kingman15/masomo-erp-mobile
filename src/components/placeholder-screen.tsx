import { Text, View } from "react-native";

type PlaceholderScreenProps = {
  title: string;
  description?: string;
};

export function PlaceholderScreen({
  title,
  description,
}: PlaceholderScreenProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 bg-background">
      <Text className="text-2xl font-medium mb-2 text-center text-foreground">{title}</Text>
      <Text className="text-sm text-muted-foreground text-center">
        {description ?? "Écran à venir."}
      </Text>
    </View>
  );
}
