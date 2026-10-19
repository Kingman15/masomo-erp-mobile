import { MENU_CATEGORIES } from "@/features/portal/menu-config";
import { MenuDynamicBadge } from "@/features/portal/menu-dynamic-badge";
import { StudentSwitcherEntry } from "@/features/portal/student-switcher-entry";
import { usePortalSelection } from "@/features/portal/use-portal-selection";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { toastNotify } from "@/lib/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

export default function PortalMenuScreen() {
  const colors = useThemeColors();
  const { selectedStudent } = usePortalSelection();
  const hasSelectedStudent = !!selectedStudent;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Menu" }} />

      <FlatList
        className="flex-1 bg-background"
        contentContainerClassName="p-4"
        data={MENU_CATEGORIES}
        numColumns={2}
        columnWrapperClassName="gap-3 mb-3"
        keyExtractor={(category) => category.slug}
        ListHeaderComponent={
          <View className="mb-4">
            <StudentSwitcherEntry />
          </View>
        }
        // Hors catégories : accessible sans élève choisi.
        ListFooterComponent={
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/portal/menu/about")}
            className="mt-1 h-12 px-4 rounded-xl border border-border bg-card flex-row items-center gap-3 active:bg-subtle"
          >
            <Ionicons name="information-circle-outline" size={18} color={colors.foreground} />
            <Text className="flex-1 text-sm font-medium text-foreground">À propos de l&apos;application</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </Pressable>
        }
        renderItem={({ item: category }) => (
          <Pressable
            onPress={() => {
              if (!hasSelectedStudent) {
                toastNotify("Veuillez d'abord choisir un élève.", "info");
                return;
              }
              router.push(`/portal/menu/${category.slug}`);
            }}
            className="flex-1 border border-border rounded-2xl bg-card active:bg-subtle active:scale-[0.98] p-4 shadow-sm"
          >
            {category.dynamicBadge && hasSelectedStudent && (
              <MenuDynamicBadge
                badge={category.dynamicBadge}
                className="absolute top-3 right-3"
              />
            )}
            <View
              className="w-11 h-11 rounded-full items-center justify-center mb-3"
              style={{
                backgroundColor: hasSelectedStudent
                  ? `${category.color}1A`
                  : colors.muted,
              }}
            >
              <Ionicons
                name={category.icon}
                size={22}
                color={hasSelectedStudent ? category.color : colors.faint}
              />
            </View>
            <Text
              className={`text-base font-semibold mb-1 ${
                hasSelectedStudent ? "text-foreground" : "text-faint"
              }`}
            >
              {category.label}
            </Text>
            <Text
              className={`text-xs ${
                hasSelectedStudent ? "text-muted-foreground" : "text-faint"
              }`}
              numberOfLines={2}
            >
              {category.description}
            </Text>
          </Pressable>
        )}
      />
    </>
  );
}
