export const portalConversationKeys = {
  all: ["portalConversations"] as const,

  list: (schoolYearId: string | null | undefined) =>
    [...portalConversationKeys.all, "list", schoolYearId ?? null] as const,

  detail: (
    deskId: string | null | undefined,
    schoolYearId: string | null | undefined,
  ) =>
    [
      ...portalConversationKeys.all,
      "detail",
      deskId ?? null,
      schoolYearId ?? null,
    ] as const,

  messages: (conversationId: string | null | undefined) =>
    [...portalConversationKeys.all, "messages", conversationId ?? null] as const,
};
