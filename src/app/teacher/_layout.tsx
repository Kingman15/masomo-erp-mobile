import { TeacherDrawerContent } from "@/features/teacher/teacher-drawer-content";
import { Drawer } from "expo-router/drawer";

export default function TeacherLayout() {
  return (
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
      <Drawer.Screen name="schedule" options={{ headerShown: false }} />
      <Drawer.Screen
        name="internal-regulations"
        options={{ headerShown: false }}
      />
      <Drawer.Screen name="documents" options={{ headerShown: false }} />
      <Drawer.Screen name="messaging" options={{ headerShown: false }} />
    </Drawer>
  );
}
