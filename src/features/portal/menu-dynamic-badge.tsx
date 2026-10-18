import { usePortalConversationsUnreadCount } from "@/hooks/queries/items/portal-conversation";
import { Text, View } from "react-native";
import type { MenuDynamicBadge as MenuDynamicBadgeType } from "./menu-config";

type MenuDynamicBadgeProps = {
  badge: MenuDynamicBadgeType;
  className?: string;
};

/**
 * Pastille de compteur d'une entrée du menu portail — masquée à zéro.
 */
export function MenuDynamicBadge({ badge, className }: MenuDynamicBadgeProps) {
  if (badge === "portalUnreadConversations") {
    return <UnreadConversationsBadge className={className} />;
  }

  return null;
}

function UnreadConversationsBadge({ className }: { className?: string }) {
  const { portalUnreadCount } = usePortalConversationsUnreadCount();

  return <CountPill count={portalUnreadCount} className={className} />;
}

function CountPill({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;

  return (
    <View
      className={`min-w-5 h-5 px-1.5 rounded-full bg-red-500 items-center justify-center ${className ?? ""}`}
    >
      <Text className="text-[11px] font-semibold text-white">
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
}
