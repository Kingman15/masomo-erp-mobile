import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { OfflineStatusPill } from "@/features/teacher/sync/offline-status-pill";
import { TeacherDrawerContent } from "@/features/teacher/teacher-drawer-content";
import { useTeacherOfflinePrefetch } from "@/features/teacher/use-teacher-offline-prefetch";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Drawer } from "expo-router/drawer";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TeacherLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  // Horaire, ROI et données des formulaires gardés pour le hors ligne.
  useTeacherOfflinePrefetch();

  return (
    <View style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <TeacherDrawerContent {...props} />}
        screenOptions={{
          headerTintColor: colors.foreground,
          headerTitleStyle: { fontWeight: "600" },
          // Aligné sur les en-têtes natifs des Stack enseignant : même bouton, retrait de 16,
          // espace avant le titre et hauteur de barre de 56 (64 par défaut pour cet en-tête).
          headerLeft: () => <DrawerMenuButton />,
          headerLeftContainerStyle: { paddingLeft: 16 },
          headerStyle: { height: insets.top + 56 },
        }}
      >
        <Drawer.Screen name="lessons" options={{ headerShown: false }} />
        <Drawer.Screen name="teaching-courses" options={{ headerShown: false }} />
        <Drawer.Screen name="evaluations" options={{ headerShown: false }} />
        <Drawer.Screen name="course-averages" options={{ headerShown: false }} />
        <Drawer.Screen name="honor-roll" options={{ headerShown: false }} />
        <Drawer.Screen name="appraisals" options={{ headerShown: false }} />
        <Drawer.Screen name="report-cards" options={{ headerShown: false }} />
        <Drawer.Screen name="deliberation" options={{ headerShown: false }} />
        <Drawer.Screen name="incidents" options={{ headerShown: false }} />
        <Drawer.Screen name="sanctions" options={{ headerShown: false }} />
        <Drawer.Screen name="attendance" options={{ headerShown: false }} />
        <Drawer.Screen name="schedule" options={{ headerShown: false }} />
        <Drawer.Screen name="calendar" options={{ headerShown: false }} />
        <Drawer.Screen
          name="internal-regulations"
          options={{ headerShown: false }}
        />
        <Drawer.Screen name="notifications" options={{ headerShown: false }} />
        <Drawer.Screen name="announcements" options={{ headerShown: false }} />
        <Drawer.Screen name="documents" options={{ headerShown: false }} />
        <Drawer.Screen name="messaging" options={{ headerShown: false }} />
        <Drawer.Screen name="sync" options={{ headerShown: false }} />
      </Drawer>

      {/* Hors ligne / envois en attente, au-dessus de tous les écrans enseignant. */}
      <OfflineStatusPill />
    </View>
  );
}
