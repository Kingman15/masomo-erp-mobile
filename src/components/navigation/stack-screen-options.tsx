import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "expo-router";
import { Platform, Pressable } from "react-native";

/** Retour, même gabarit que DrawerMenuButton : le titre des écrans de détail s'aligne sur celui des listes. */
function HeaderBackButton() {
  const colors = useThemeColors();
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Retour"
      className="mr-3 active:opacity-60"
    >
      <Ionicons name="arrow-back" size={24} color={colors.foreground} />
    </Pressable>
  );
}

/** Options communes des Stack (enseignant et portail). L'écran racine garde son propre bouton (menu) ou aucun. */
export function useStackScreenOptions() {
  const colors = useThemeColors();

  return {
    headerTintColor: colors.foreground,
    headerTitleStyle: { fontWeight: "600" as const },
    // Android : la flèche native repousse le titre à 72 dp, contre ~50 dp à côté du bouton menu.
    // iOS garde son bouton retour natif (chevron + libellé).
    ...(Platform.OS === "android" && {
      headerLeft: ({ canGoBack }: { canGoBack?: boolean }) =>
        canGoBack ? <HeaderBackButton /> : null,
    }),
  };
}
