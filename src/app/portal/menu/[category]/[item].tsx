import { PlaceholderScreen } from "@/components/placeholder-screen";
import { getMenuSubItem } from "@/features/portal/menu-config";
import { Stack, useLocalSearchParams } from "expo-router";

export default function PortalMenuSubItemScreen() {
  const { category: categorySlug, item: itemSlug } = useLocalSearchParams<{
    category: string;
    item: string;
  }>();
  const item = getMenuSubItem(categorySlug, itemSlug);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: item?.label ?? "Détail" }} />
      <PlaceholderScreen title={item?.label ?? "Introuvable"} />
    </>
  );
}
