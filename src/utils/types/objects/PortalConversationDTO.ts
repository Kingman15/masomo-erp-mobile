export interface PortalConversationDTO {
  // null uniquement pour un fil virtuel (guichet jamais contacté) — jamais persisté
  id: string | null;
  counterpartDeskId: string;
  isUnread: boolean;
  hasThread: boolean | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  serviceDesk: {
    id: string;
    name: string;
  } | null;
}
