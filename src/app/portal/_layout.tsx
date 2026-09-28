import { useUnreadNotificationsCount } from "@/hooks/queries/items/notification";
import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router/js-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PortalLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useUnreadNotificationsCount({});

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // En-têtes des onglets alignés sur les en-têtes natifs du Stack « Menu » (barre de 56, titre en 600).
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontWeight: "600" },
        headerStyle: { height: insets.top + 56 },
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.faint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tableau de bord",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "menu" : "menu-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              color={color}
              size={size}
            />
          ),
          tabBarBadge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : undefined,
          tabBarBadgeStyle: { backgroundColor: "#EF4444" },
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
