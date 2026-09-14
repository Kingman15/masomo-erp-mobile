export type NotificationsFiltersForm = {
  type: string | null;
  unreadOnly: boolean;
};

export const defaultNotificationsFilters: NotificationsFiltersForm = {
  type: null,
  unreadOnly: false,
};
