import { useAuthStore } from "@/stores/auth";
import { useSegments } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Hauteur de la barre d'onglets du portail, au-dessus de laquelle la pastille doit rester visible
const PORTAL_TAB_BAR_HEIGHT = 56;

/**
 * École de démonstration : rappel permanent que les données sont fictives et regénérées chaque nuit (demo:reset).
 * Pastille flottante sans effet sur les touches, pour ne pas décaler les en-têtes des écrans (safe area gérée par chacun).
 */
export function DemoModeBadge() {
  const isDemo = useAuthStore((state) => state.status === "signedIn" && Boolean(state.user?.isDemo));
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  if (!isDemo) return null;

  const bottom = insets.bottom + (segments[0] === "portal" ? PORTAL_TAB_BAR_HEIGHT : 0) + 8;

  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom }} className="items-center px-4">
      <View className="rounded-full bg-amber-500 px-3 py-1.5">
        <Text className="text-white text-xs font-medium">Mode démo : données fictives, réinitialisées chaque nuit</Text>
      </View>
    </View>
  );
}
