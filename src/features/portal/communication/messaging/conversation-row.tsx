import { PartyAvatar } from "@/features/staff/messaging/party-avatar";
import { formatDateTime } from "@/lib/format";
import type { PortalConversationDTO } from "@/utils/types/objects/PortalConversationDTO";
import { Pressable, Text, View } from "react-native";

type ConversationRowProps = {
  item: PortalConversationDTO;
  onPress: (item: PortalConversationDTO) => void;
  isFirst?: boolean;
};

export function ConversationRow({
  item,
  onPress,
  isFirst,
}: ConversationRowProps) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      className={`flex-row items-center gap-3 px-4 py-4 ${isFirst ? "" : "border-t border-divider"}`}
    >
      <PartyAvatar name={item.serviceDesk?.name} />

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          {item.isUnread && (
            <View className="w-2 h-2 rounded-full bg-blue-600" />
          )}
          <Text
            className={`text-base flex-1 ${item.isUnread ? "font-bold text-foreground" : "font-semibold text-foreground"}`}
            numberOfLines={1}
          >
            {item.serviceDesk?.name ?? "N/A"}
          </Text>
        </View>

        {item.hasThread && item.lastMessagePreview && (
          <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={1}>
            {item.lastMessagePreview}
          </Text>
        )}
      </View>

      {item.hasThread && item.lastMessageAt && (
        <Text className="text-xs text-faint">
          {formatDateTime(item.lastMessageAt)}
        </Text>
      )}
    </Pressable>
  );
}
