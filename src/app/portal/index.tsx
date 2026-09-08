import { useAuthStore } from "@/stores/auth";
import { Text, View } from "react-native";

export default function PortalDashboardScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <View className="flex-1 items-center justify-center px-6 bg-white">
      <Text className="text-2xl font-medium mb-2">Tableau de bord</Text>
      <Text className="text-sm text-gray-500 text-center">
        Bienvenue {user?.name ?? "utilisateur"}, écran à venir.
      </Text>
    </View>
  );
}
