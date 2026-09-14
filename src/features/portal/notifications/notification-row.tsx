import { formatDateTime } from "@/lib/format";
import type { NotificationDTO } from "@/utils/types/objects/NotificationDTO";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import {
  NOTIFICATION_SEVERITY_BADGE,
  NOTIFICATION_TYPE_LABEL_MAP,
  resolveNotificationSeverity,
} from "./notification-type";

type NotificationRowProps = {
  notification: NotificationDTO;
  onPress: (notification: NotificationDTO) => void;
};

function NotificationRowComponent({
  notification,
  onPress,
}: NotificationRowProps) {
  const severity = resolveNotificationSeverity(notification.type);
  const badge = NOTIFICATION_SEVERITY_BADGE[severity];

  return (
    <Pressable
      onPress={() => onPress(notification)}
      className="px-4 py-3 border-b border-gray-100 bg-white"
    >
      <View className="flex-row items-start gap-2">
        {!notification.isRead && (
          <View className="h-2 w-2 rounded-full bg-blue-600 mt-1.5" />
        )}
        <Text
          className="flex-1 text-sm font-medium text-black"
          numberOfLines={1}
        >
          {notification.title}
        </Text>
      </View>

      {notification.body && (
        <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>
          {notification.body}
        </Text>
      )}

      <View className="flex-row flex-wrap items-center gap-2 mt-2">
        <View className={`px-2 py-0.5 rounded-full ${badge.bg}`}>
          <Text className={`text-xs font-medium ${badge.fg}`}>
            {NOTIFICATION_TYPE_LABEL_MAP[notification.type] ??
              notification.type}
          </Text>
        </View>

        <Text className="text-xs text-gray-400">
          {formatDateTime(notification.occurredAt)}
        </Text>

        {notification.student && (
          <Text
            className="text-xs text-gray-400"
            numberOfLines={1}
          >
            {notification.student.fullName}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export const NotificationRow = memo(NotificationRowComponent);
