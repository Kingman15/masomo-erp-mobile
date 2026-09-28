import { formatDateTime } from "@/lib/format";
import type { Conversation } from "@/utils/types/Conversation";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { PartyAvatar } from "./party-avatar";

type ConversationRowProps = {
  item: Conversation;
  isFirst?: boolean;
};

export function ConversationRow({ item, isFirst }: ConversationRowProps) {
  return (
    <Pressable
      onPress={() => router.push(`/teacher/messaging/${item.id}`)}
      className={`flex-row items-center gap-3 px-4 py-4 ${isFirst ? "" : "border-t border-divider"}`}
    >
      <PartyAvatar name={item.party?.name} />

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          {item.isUnread && (
            <View className="w-2 h-2 rounded-full bg-blue-600" />
          )}
          <Text
            className={`text-base flex-1 ${item.isUnread ? "font-bold text-foreground" : "font-semibold text-foreground"}`}
            numberOfLines={1}
          >
            {item.party?.name ?? "N/A"}
          </Text>
        </View>

        {item.lastMessagePreview && (
          <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={1}>
            {item.lastMessagePreview}
          </Text>
        )}
      </View>

      <Text className="text-xs text-faint">
        {formatDateTime(item.lastMessageAt)}
      </Text>
    </Pressable>
  );
}
