import { ThemeColors } from "@/constants/colors";
import { useColorScheme } from "nativewind";

// Suit le même schéma que les classes NativeWind (y compris un futur choix forcé via colorScheme.set()).
export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  return ThemeColors[colorScheme === "dark" ? "dark" : "light"];
}
