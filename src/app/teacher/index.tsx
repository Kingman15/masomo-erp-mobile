import { buildGreeting } from "@/lib/greeting";
import { useAuthStore } from "@/stores/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Pressable, ScrollView, Text, View } from "react-native";

type QuickAccessItem = {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
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

  const greeting = user
    ? buildGreeting(user.name ?? user.username ?? "enseignant", user.id)
    : "Bienvenue.";

  return (
    <>
      <Drawer.Screen options={{ title: "Accueil" }} />

      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <Text className="text-lg font-semibold text-gray-900">
            Tableau de bord
          </Text>
          <Text className="text-sm text-gray-500 mt-1">{greeting}</Text>
        </View>

        <View className="flex-row flex-wrap gap-3 mt-3">
          {QUICK_ACCESS.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.label}
                className="w-[47%] p-4 border border-gray-200 rounded-2xl gap-2 active:bg-gray-50"
              >
                <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                  <Ionicons name={item.icon} size={20} color="#7351E8" />
                </View>
                <Text className="text-sm font-semibold text-gray-900">
                  {item.label}
                </Text>
                <Text className="text-xs text-gray-500" numberOfLines={2}>
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
