import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

type FilterButtonProps = {
  activeCount?: number;
  onPress: () => void;
  fullWidth?: boolean;
};

export function FilterButton({
  activeCount = 0,
  onPress,
  fullWidth = false,
}: FilterButtonProps) {
  const hasActiveFilters = activeCount > 0;

  if (fullWidth) {
    return (
      <Pressable
        onPress={onPress}
        className={`h-11 w-full flex-row items-center justify-center gap-2 rounded-lg ${
          hasActiveFilters ? "bg-black" : "bg-gray-100"
        }`}
      >
        <Ionicons
          name="options-outline"
          size={18}
          color={hasActiveFilters ? "#FFFFFF" : "#374151"}
        />
        <Text
          className={`text-sm font-medium ${
            hasActiveFilters ? "text-white" : "text-gray-700"
          }`}
        >
          {hasActiveFilters ? `Filtrer (${activeCount})` : "Filtrer"}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className={`h-11 w-11 items-center justify-center rounded-lg ${
        hasActiveFilters ? "bg-black" : "bg-gray-100"
      }`}
    >
      <Ionicons
        name="options-outline"
        size={20}
        color={hasActiveFilters ? "#FFFFFF" : "#374151"}
      />
      {hasActiveFilters && (
        <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 items-center justify-center">
          <Text className="text-[10px] font-semibold text-white">
            {activeCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
