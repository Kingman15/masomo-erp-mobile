import { BRAND_PRIMARY } from "@/constants/theme";
import type { RoutePath } from "@/features/teacher/menu-config";
import { buildGreeting } from "@/lib/greeting";
import { useAuthStore } from "@/stores/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useColorScheme } from "nativewind";
import { Pressable, ScrollView, Text, View } from "react-native";

type QuickAccessItem = {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: RoutePath;
};

const QUICK_ACCESS: QuickAccessItem[] = [
  {
    label: "Leçons",
    description: "Vos leçons de cours",
    icon: "book-outline",
    href: "/teacher/lessons",
  },
  {
    label: "Cours",
    description: "Suivi de vos cours",
    icon: "library-outline",
    href: "/teacher/teaching-courses",
  },
  {
    label: "Évaluation",
    description: "Évaluations de cours",
    icon: "checkmark-done-outline",
    href: "/teacher/evaluations",
  },
  {
    label: "Horaire",
    description: "Votre emploi du temps",
    icon: "time-outline",
    href: "/teacher/schedule",
  },
  {
    label: "Présences",
    description: "Pointage des présences",
    icon: "checkbox-outline",
    href: "/teacher/attendance",
  },
  {
    label: "Incidents",
    description: "Signaler et suivre les incidents",
    icon: "warning-outline",
    href: "/teacher/incidents",
  },
  {
    label: "Sanctions",
    description: "Sanctions disciplinaires",
    icon: "hammer-outline",
    href: "/teacher/sanctions",
  },
  {
    label: "Messagerie",
    description: "Vos conversations",
    icon: "chatbubble-ellipses-outline",
    href: "/teacher/messaging",
  },
];

export default function TeacherHomeScreen() {
  const user = useAuthStore((s) => s.user);
  const isDark = useColorScheme().colorScheme === "dark";

  const greeting = user
    ? buildGreeting(user.name ?? user.username ?? "enseignant", user.id)
    : "Bienvenue.";

  return (
    <>
      <Drawer.Screen options={{ title: "Accueil" }} />

      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="bg-card rounded-2xl p-4 shadow-sm border border-divider">
          <Text className="text-lg font-semibold text-foreground">
            Tableau de bord
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">{greeting}</Text>
        </View>

        <View className="flex-row flex-wrap gap-3 mt-3">
          {QUICK_ACCESS.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.label}
                className="w-[47%] p-4 border border-border rounded-2xl gap-2 dark:bg-card active:bg-subtle dark:active:bg-muted"
              >
                <View className="w-10 h-10 rounded-full bg-subtle dark:bg-primary/30 items-center justify-center">
                  <Ionicons name={item.icon} size={20} color={isDark ? "#FFFFFF" : BRAND_PRIMARY} />
                </View>
                <Text className="text-sm font-semibold text-foreground">
                  {item.label}
                </Text>
                <Text className="text-xs text-muted-foreground" numberOfLines={2}>
                  {item.description}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
