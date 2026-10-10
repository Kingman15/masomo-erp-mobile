import {
  useIsOnline,
  useOfflineQueueCounts,
} from "@/lib/offline/use-offline-queue";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, usePathname } from "expo-router";
import { useColorScheme } from "nativewind";
import { Pressable, Text } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SYNC_HREF = "/staff/sync";

/**
 * Pastille flottante en bas d'écran : hors ligne, envois en attente ou refusés.
 * Masquée quand tout est synchronisé, et sur l'écran Synchronisation lui-même.
 */
export function OfflineStatusPill() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isDark = useColorScheme().colorScheme === "dark";
  const isOnline = useIsOnline();
  const { pending, failed } = useOfflineQueueCounts();

  if (pathname === SYNC_HREF) return null;
  if (isOnline && pending === 0 && failed === 0) return null;

  const parts: string[] = [];
  if (!isOnline) parts.push("Hors ligne");
  if (pending > 0) parts.push(`${pending} en attente`);
  if (failed > 0) parts.push(`${failed} refusé${failed > 1 ? "s" : ""}`);

  // Teintes 50/200/700 en clair, 950/800/300 en sombre.
  const tone =
    failed > 0
      ? isDark
        ? { bg: "#450A0A", border: "#991B1B", color: "#FCA5A5", icon: "alert-circle-outline" as const }
        : { bg: "#FEF2F2", border: "#FECACA", color: "#B91C1C", icon: "alert-circle-outline" as const }
      : !isOnline
        ? isDark
          ? { bg: "#451A03", border: "#92400E", color: "#FCD34D", icon: "cloud-offline-outline" as const }
          : { bg: "#FFFBEB", border: "#FDE68A", color: "#B45309", icon: "cloud-offline-outline" as const }
        : isDark
          ? { bg: "#172554", border: "#1E40AF", color: "#93C5FD", icon: "cloud-upload-outline" as const }
          : { bg: "#EFF6FF", border: "#BFDBFE", color: "#1D4ED8", icon: "cloud-upload-outline" as const };

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutDown.duration(150)}
      pointerEvents="box-none"
      style={{ position: "absolute", left: 0, right: 0, bottom: insets.bottom + 16, alignItems: "center" }}
    >
      <Pressable
        onPress={() => router.push(SYNC_HREF)}
        className="flex-row items-center gap-2 px-4 py-2.5 rounded-full border"
        style={{ backgroundColor: tone.bg, borderColor: tone.border }}
      >
        <Ionicons name={tone.icon} size={16} color={tone.color} />
        <Text className="text-sm font-medium" style={{ color: tone.color }}>
          {parts.join(" · ")}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
