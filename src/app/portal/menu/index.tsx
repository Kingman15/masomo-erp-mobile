import { MENU_CATEGORIES } from "@/features/portal/menu-config";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

export default function PortalMenuScreen() {
  return (
    <FlatList
      className="flex-1 bg-white"
      contentContainerClassName="p-4"
      data={MENU_CATEGORIES}
      numColumns={2}
      columnWrapperClassName="gap-3 mb-3"
      keyExtractor={(category) => category.slug}
      ListHeaderComponent={
        <View className="mb-4">
          <Text className="text-2xl font-semibold text-gray-900">Menu</Text>
        </View>
      }
      renderItem={({ item: category }) => (
        <Pressable
          onPress={() => router.push(`/portal/menu/${category.slug}`)}
          className="flex-1 border border-gray-200 rounded-2xl bg-white active:bg-gray-50 active:scale-[0.98] p-4 shadow-sm"
        >
          <View
            className="w-11 h-11 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: `${category.color}1A` }}
          >
            <Ionicons name={category.icon} size={22} color={category.color} />
          </View>
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {category.label}
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={2}>
            {category.description}
          </Text>
        </Pressable>
      )}
    />
  );
}
