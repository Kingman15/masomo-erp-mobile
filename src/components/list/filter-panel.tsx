import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type FilterPanelProps = {
  title: string;
  children: React.ReactNode;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
  applyLabel?: string;
  resetLabel?: string;
  /** Le panneau ne pose pas sa propre marge horizontale : à utiliser quand le
   * parent fournit déjà l'espacement (ex. contenu déjà en padding). */
  bleed?: boolean;
};

export function FilterPanel({
  title,
  children,
  onApply,
  onReset,
  onClose,
  applyLabel = "Appliquer",
  resetLabel = "Réinitialiser",
  bleed = false,
}: FilterPanelProps) {
  const colors = useThemeColors();
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(120)}
      className={`${bleed ? "" : "mx-4"} mb-2 rounded-xl border border-border bg-card overflow-hidden`}
    >
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-divider">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.foregroundSecondary} />
        </Pressable>
      </View>

      <View className="px-4 pt-3">{children}</View>

      <View className="flex-row gap-3 px-4 py-3 border-t border-divider mt-1">
        <Pressable
          onPress={onReset}
          className="flex-1 h-10 rounded-lg border border-input items-center justify-center"
        >
          <Text className="font-medium text-foreground-secondary">{resetLabel}</Text>
        </Pressable>
        <Pressable
          onPress={onApply}
          className="flex-1 h-10 rounded-lg bg-foreground items-center justify-center"
        >
          <Text className="font-medium text-background">{applyLabel}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
