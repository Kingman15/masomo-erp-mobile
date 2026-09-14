import { MENU_CATEGORIES } from "@/features/portal/menu-config";
import { StudentSwitcherEntry } from "@/features/portal/student-switcher-entry";
import { usePortalSelection } from "@/features/portal/use-portal-selection";
import { toastNotify } from "@/lib/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

export default function PortalMenuScreen() {
  const { selectedStudent } = usePortalSelection();
  const hasSelectedStudent = !!selectedStudent;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Menu" }} />

      <FlatList
        className="flex-1 bg-white"
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
            className="flex-1 border border-gray-200 rounded-2xl bg-white active:bg-gray-50 active:scale-[0.98] p-4 shadow-sm"
          >
            <View
              className="w-11 h-11 rounded-full items-center justify-center mb-3"
              style={{
                backgroundColor: hasSelectedStudent
                  ? `${category.color}1A`
                  : "#F3F4F6",
              }}
            >
              <Ionicons
                name={category.icon}
                size={22}
                color={hasSelectedStudent ? category.color : "#9CA3AF"}
              />
            </View>
            <Text
              className={`text-base font-semibold mb-1 ${
                hasSelectedStudent ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {category.label}
            </Text>
            <Text
              className={`text-xs ${
                hasSelectedStudent ? "text-gray-500" : "text-gray-400"
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
