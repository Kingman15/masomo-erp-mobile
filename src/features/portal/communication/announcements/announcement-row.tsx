import { formatShortDate } from "@/lib/format";
import type { PortalAnnouncementDTO } from "@/utils/types/objects/PortalAnnouncementDTO";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { ANNOUNCEMENT_CATEGORY_LABEL_MAP } from "./announcement-category";

type AnnouncementRowProps = {
  item: PortalAnnouncementDTO;
  onPress: (item: PortalAnnouncementDTO) => void;
  onMarkAsRead: (item: PortalAnnouncementDTO) => void;
  isMarkingAsRead?: boolean;
  isFirst?: boolean;
};

export function AnnouncementRow({
  item,
  onPress,
  onMarkAsRead,
  isMarkingAsRead = false,
  isFirst,
}: AnnouncementRowProps) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      className={`px-4 py-4 ${isFirst ? "" : "border-t border-gray-100"}`}
    >
      <View className="flex-row items-start gap-3">
        <View className="w-2 pt-1.5 items-center">
          {!item.isRead && (
            <View className="h-2 w-2 rounded-full bg-blue-600" />
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1 flex-row items-center gap-1.5 flex-wrap">
              {item.isPinned && (
                <Ionicons name="pin" size={13} color="#6B7280" />
              )}
              <Text
                className="text-base font-bold text-black flex-shrink"
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </View>

            {item.category && (
              <View className="px-2 py-0.5 rounded-full bg-gray-100 shrink-0">
                <Text className="text-xs font-medium text-gray-600">
                  {ANNOUNCEMENT_CATEGORY_LABEL_MAP[item.category]}
                </Text>
              </View>
            )}
          </View>

          {item.body && (
            <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
              {item.body}
            </Text>
          )}

          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-xs text-gray-400">
              Publié le {formatShortDate(item.publishedAt)}
            </Text>

            {!item.isRead && (
              <Pressable
                onPress={() => onMarkAsRead(item)}
                disabled={isMarkingAsRead}
                hitSlop={8}
              >
                <Text className="text-xs font-medium text-blue-600">
                  {isMarkingAsRead ? "En cours..." : "Marquer comme lu"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
