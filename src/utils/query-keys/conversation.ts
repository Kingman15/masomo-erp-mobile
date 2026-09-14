import type { ConversationTab } from "@/api/endpoints/conversation";

export const conversationKeys = {
  all: ["conversations"] as const,
  list: (deskId: string | null | undefined, tab: ConversationTab) =>
    [...conversationKeys.all, "list", deskId, tab] as const,
  detail: (id: string | undefined) =>
    [...conversationKeys.all, "detail", id] as const,
  messages: (id: string | undefined) =>
    [...conversationKeys.all, "messages", id] as const,
  attachableDocuments: (
    deskId: string | null | undefined,
    filters: { mine?: boolean },
  ) => [...conversationKeys.all, "attachable-documents", deskId, filters] as const,
};
