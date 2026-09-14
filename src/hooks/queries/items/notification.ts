import api from "@/api/client";
import {
  index,
  markAllAsRead,
  markAsRead,
  unreadCount,
} from "@/api/endpoints/notification";
import { notificationKeys } from "@/utils/query-keys/notification";
import type { NotificationDTO } from "@/utils/types/objects/NotificationDTO";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useInfiniteScrollQuery } from "../use-infinite-scroll-query";
import { useSingletonQuery } from "../use-singleton-query";

interface UseNotificationsParams {
  filters: {
    studentId?: string | null;
    type?: string | null;
    unreadOnly?: boolean | null;
  };
  enabled?: boolean;
}

export function useNotifications({
  filters,
  enabled = true,
}: UseNotificationsParams) {
  const normalizedFilters = {
    studentId: filters.studentId ?? undefined,
    type: filters.type ?? undefined,
    unreadOnly: filters.unreadOnly ?? undefined,
  };

  const query = useInfiniteScrollQuery<NotificationDTO>({
    queryKey: notificationKeys.list(normalizedFilters),
    queryFn: (page, perPage) => index(api, normalizedFilters, page, perPage),
    label: "Notifications",
    enabled,
  });

  return {
    notifications: query.items,
    notificationsMeta: query.meta,
    notificationsError: query.error,
    notificationsIsLoading: query.isLoading,
    notificationsIsFetching: query.isFetching,
    notificationsIsFetchingNextPage: query.isFetchingNextPage,
    notificationsIsRefetching: query.isRefetching,
    notificationsHasNextPage: query.hasNextPage,
    fetchNextNotifications: query.fetchNextPage,
    loadNotifications: query.refetch,
  };
}

interface UseUnreadNotificationsCountParams {
  studentId?: string | null;
  enabled?: boolean;
}

export function useUnreadNotificationsCount({
  studentId,
  enabled = true,
}: UseUnreadNotificationsCountParams) {
  const query = useSingletonQuery<{ count: number }>({
    queryKey: notificationKeys.unreadCount(studentId),
    queryFn: () => unreadCount(api, studentId),
    label: "Notifications non lues",
    enabled,
  });

  return {
    unreadCount: query.data?.count ?? 0,
    unreadCountIsLoading: query.isLoading,
    loadUnreadCount: query.refetch,
  };
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (notification: NotificationDTO) =>
      markAsRead(api, notification.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  return {
    markNotificationAsRead: mutation.mutate,
    markNotificationAsReadIsPending: mutation.isPending,
  };
}

interface MarkAllNotificationsAsReadParams {
  studentId?: string | null;
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ studentId }: MarkAllNotificationsAsReadParams) =>
      markAllAsRead(api, { studentId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  return {
    markAllNotificationsAsRead: mutation.mutateAsync,
    markAllNotificationsAsReadIsPending: mutation.isPending,
  };
}
