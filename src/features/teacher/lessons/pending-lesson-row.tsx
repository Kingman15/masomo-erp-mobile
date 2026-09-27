import type { LessonPayload } from "@/api/endpoints/lesson";
import type { OfflineQueueItem } from "@/lib/offline/use-offline-queue";
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
  const lesson = item.payload as LessonPayload;

  return (
    <View className="px-4 py-3 border-b border-gray-100 bg-amber-50/40">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-medium text-gray-500 capitalize">
          {formatLessonDate(lesson.lessonDate)}
        </Text>
        <Text className="text-xs text-gray-400">
          {`${lesson.startTime} - ${lesson.endTime}`}
        </Text>
      </View>

      <Text
        className="text-base font-semibold text-black mt-1"
        numberOfLines={1}
      >
        {lesson.subject}
      </Text>

      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-1">
        <Text className="text-xs text-gray-500" numberOfLines={1}>
          {item.label}
        </Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="cloud-offline-outline" size={13} color="#B45309" />
          <Text className="text-xs text-amber-700">Non synchronisée</Text>
        </View>
      </View>
    </View>
  );
}

export const PendingLessonRow = memo(PendingLessonRowComponent);
