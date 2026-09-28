import { PlaceholderScreen } from "@/components/placeholder-screen";
import { getMenuCategory } from "@/features/portal/menu-config";
import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";

export default function PortalMenuCategoryScreen() {
  const colors = useThemeColors();
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
      <ScrollView className="flex-1 bg-background">
        {category.subItems.map((item, index) => (
          <Pressable
            key={item.slug}
            onPress={() => router.push(`/portal/menu/${category.slug}/${item.slug}`)}
            className={`flex-row items-center gap-3 px-4 py-4 active:bg-subtle ${
              index > 0 ? "border-t border-divider" : ""
            }`}
          >
            <Ionicons name={item.icon} size={20} color={colors.foreground} />
            <Text className="flex-1 text-base text-foreground">{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.faint} />
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}
