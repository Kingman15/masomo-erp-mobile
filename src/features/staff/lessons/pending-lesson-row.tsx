import type { LessonPayload } from "@/api/endpoints/lesson";
import type { OfflineQueueItem } from "@/lib/offline/use-offline-queue";
import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import { Text, View } from "react-native";

function formatLessonDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

type PendingLessonRowProps = {
  item: OfflineQueueItem;
};

/**
 * Leçon saisie sur l'appareil, pas encore acceptée par le serveur. Non cliquable : sa fiche n'existe pas encore côté serveur.
 */
function PendingLessonRowComponent({ item }: PendingLessonRowProps) {
  const colors = useThemeColors();
  const lesson = item.payload as LessonPayload;

  return (
    <View className="px-4 py-3 border-b border-divider bg-amber-50/40 dark:bg-amber-950/40">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-medium text-muted-foreground capitalize">
          {formatLessonDate(lesson.lessonDate)}
        </Text>
        <Text className="text-xs text-faint">
          {`${lesson.startTime} - ${lesson.endTime}`}
        </Text>
      </View>

      <Text
        className="text-base font-semibold text-foreground mt-1"
        numberOfLines={1}
      >
        {lesson.subject}
      </Text>

      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-1">
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {item.label}
        </Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="cloud-offline-outline" size={13} color={colors.warning} />
          <Text className="text-xs text-amber-700 dark:text-amber-300">Non synchronisée</Text>
        </View>
      </View>
    </View>
  );
}

export const PendingLessonRow = memo(PendingLessonRowComponent);
