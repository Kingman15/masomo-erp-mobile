import { MENU_CATEGORIES } from "@/features/portal/menu-config";
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
