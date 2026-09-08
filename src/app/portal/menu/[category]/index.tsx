import { PlaceholderScreen } from "@/components/placeholder-screen";
import { getMenuCategory } from "@/features/portal/menu-config";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";

export default function PortalMenuCategoryScreen() {
  const { category: categorySlug } = useLocalSearchParams<{ category: string }>();
  const category = getMenuCategory(categorySlug);

  if (!category) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: "Menu" }} />
        <PlaceholderScreen title="Introuvable" description="Cette section n'existe pas." />
      </>
    );
  }

  if (!category.subItems || category.subItems.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: category.label }} />
        <PlaceholderScreen title={category.label} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: category.label }} />
      <ScrollView className="flex-1 bg-white">
        {category.subItems.map((item, index) => (
          <Pressable
            key={item.slug}
            onPress={() => router.push(`/portal/menu/${category.slug}/${item.slug}`)}
            className={`flex-row items-center gap-3 px-4 py-4 active:bg-gray-50 ${
              index > 0 ? "border-t border-gray-100" : ""
            }`}
          >
            <Ionicons name={item.icon} size={20} color="#1f2937" />
            <Text className="flex-1 text-base text-gray-800">{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}
