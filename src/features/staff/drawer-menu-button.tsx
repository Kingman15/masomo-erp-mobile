import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "expo-router";
import { Pressable } from "react-native";

/**
 * Bouton du menu latéral : l'en-tête fournit le retrait à gauche, le bouton l'espace avant le titre.
 * DrawerToggleButton ajoutait sa marge à celle de l'en-tête natif des Stack,
 * ce qui décalait l'icône par rapport aux écrans du Drawer (Accueil, Profil).
 */
export function DrawerMenuButton() {
  const colors = useThemeColors();
  const navigation = useNavigation();

  return (
    <Pressable
      // L'action remonte jusqu'au Drawer parent, y compris depuis un écran de Stack imbriqué.
      onPress={() => navigation.dispatch({ type: "TOGGLE_DRAWER" })}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Ouvrir le menu"
      // Espace avant le titre, identique dans l'en-tête du Drawer et dans ceux des Stack.
      className="mr-3 active:opacity-60"
    >
      <Ionicons name="menu" size={24} color={colors.foreground} />
    </Pressable>
  );
}
