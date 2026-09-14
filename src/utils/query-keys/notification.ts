export const notificationKeys = {
  all: ["notifications"] as const,

  list: (filters: {
    studentId?: string | null;
    type?: string | null;
    unreadOnly?: boolean | null;
  }) => [...notificationKeys.all, "list", filters] as const,

  unreadCount: (studentId?: string | null) =>
    [...notificationKeys.all, "unread-count", studentId] as const,
};
