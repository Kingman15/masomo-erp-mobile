import { useAuthStore } from "@/stores/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";

/**
 * École de démonstration : rappel que les données sont fictives et regénérées chaque nuit (demo:reset).
 * Encart placé dans le contenu (accueil, menu) plutôt que flottant : il ne recouvre jamais les boutons d'action.
 */
export function DemoModeNotice({ className = "" }: { className?: string }) {
  const isDemo = useAuthStore((state) => state.status === "signedIn" && Boolean(state.user?.isDemo));
  const isDark = useColorScheme().colorScheme === "dark";

  if (!isDemo) return null;

  return (
    <View
      className={`flex-row items-center gap-3 p-3 rounded-2xl border bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800 ${className}`}
    >
      <Ionicons name="flask-outline" size={18} color={isDark ? "#FCD34D" : "#B45309"} />
      <View className="flex-1">
        <Text className="text-sm font-semibold text-amber-700 dark:text-amber-300">Mode démo</Text>
        <Text className="text-xs text-amber-700 dark:text-amber-300">Données fictives, réinitialisées chaque nuit.</Text>
      </View>
    </View>
  );
}
