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
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(120)}
      className={`${bleed ? "" : "mx-4"} mb-2 rounded-xl border border-gray-200 bg-white overflow-hidden`}
    >
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-base font-semibold">{title}</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={20} color="#374151" />
        </Pressable>
      </View>

      <View className="px-4 pt-3">{children}</View>

      <View className="flex-row gap-3 px-4 py-3 border-t border-gray-100 mt-1">
        <Pressable
          onPress={onReset}
          className="flex-1 h-10 rounded-lg border border-gray-300 items-center justify-center"
        >
          <Text className="font-medium text-gray-700">{resetLabel}</Text>
        </Pressable>
        <Pressable
          onPress={onApply}
          className="flex-1 h-10 rounded-lg bg-black items-center justify-center"
        >
          <Text className="font-medium text-white">{applyLabel}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
