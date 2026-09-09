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
    </Drawer>
  );
}
