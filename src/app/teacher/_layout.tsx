import { OfflineStatusPill } from "@/features/teacher/sync/offline-status-pill";
import { TeacherDrawerContent } from "@/features/teacher/teacher-drawer-content";
import { Drawer } from "expo-router/drawer";
import { View } from "react-native";

export default function TeacherLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <TeacherDrawerContent {...props} />}
        screenOptions={{
          headerTintColor: "#000000",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Drawer.Screen name="lessons" options={{ headerShown: false }} />
        <Drawer.Screen name="teaching-courses" options={{ headerShown: false }} />
        <Drawer.Screen name="evaluations" options={{ headerShown: false }} />
        <Drawer.Screen name="incidents" options={{ headerShown: false }} />
        <Drawer.Screen name="sanctions" options={{ headerShown: false }} />
        <Drawer.Screen name="attendance" options={{ headerShown: false }} />
        <Drawer.Screen name="schedule" options={{ headerShown: false }} />
        <Drawer.Screen
          name="internal-regulations"
          options={{ headerShown: false }}
        />
        <Drawer.Screen name="documents" options={{ headerShown: false }} />
        <Drawer.Screen name="messaging" options={{ headerShown: false }} />
        <Drawer.Screen name="sync" options={{ headerShown: false }} />
      </Drawer>

      {/* Hors ligne / envois en attente, au-dessus de tous les écrans enseignant. */}
      <OfflineStatusPill />
    </View>
  );
}
