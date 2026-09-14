import { FilterButton } from "@/components/list/filter-button";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "@/hooks/queries/items/notification";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import type { NotificationDTO } from "@/utils/types/objects/NotificationDTO";
import { FlashList } from "@shopify/flash-list";
import { Stack, router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { NotificationRow } from "./notification-row";
import { NotificationsFilterPanel } from "./notifications-filter-panel";
import {
  defaultNotificationsFilters,
  type NotificationsFiltersForm,
} from "./notifications-filters";
import { resolveNotificationRoute } from "./notification-type";

export function NotificationsScreen() {
  const [filters, setFilters] = useState<NotificationsFiltersForm>(
    defaultNotificationsFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { unreadCount, loadUnreadCount } = useUnreadNotificationsCount({});

  const {
    notifications,
    notificationsMeta,
    notificationsError,
    notificationsIsLoading,
    notificationsIsFetchingNextPage,
    notificationsIsRefetching,
    notificationsHasNextPage,
    fetchNextNotifications,
    loadNotifications,
  } = useNotifications({
    filters: {
      type: filters.type,
      unreadOnly: filters.unreadOnly || null,
    },
  });

  const { markNotificationAsRead } = useMarkNotificationAsRead();
  const { markAllNotificationsAsRead, markAllNotificationsAsReadIsPending } =
    useMarkAllNotificationsAsRead();

  // Expo Router garde les écrans d'onglets montés en arrière-plan (pas de
  // remount au changement d'onglet, contrairement aux routes web) : sans ça,
  // revenir sur cet onglet ne rafraîchirait jamais les notifications reçues
  // entre-temps.
  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
      loadNotifications();
    }, [loadUnreadCount, loadNotifications]),
  );

  const activeFilterCount = useMemo(
    () => (filters.type ? 1 : 0) + (filters.unreadOnly ? 1 : 0),
    [filters],
  );

  const handlePressNotification = useCallback(
    (notification: NotificationDTO) => {
      const target = resolveNotificationRoute(notification);
      if (target) {
        router.push(target as Href);
      }

      if (!notification.isRead) {
        markNotificationAsRead(notification);
      }
    },
    [markNotificationAsRead],
  );

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead({});
      toastNotify("Notifications marquées comme lues.", "success");
    } catch (error) {
      handleApiError(error);
    }
  };

  const renderNotification = useCallback(
    ({ item }: { item: NotificationDTO }) => (
      <NotificationRow notification={item} onPress={handlePressNotification} />
    ),
    [handlePressNotification],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Notifications" }} />

      <View className="flex-1 bg-white">
        <View className="flex-row items-center gap-3 px-4 pt-3 pb-2">
          <FilterButton
            fullWidth
            activeCount={activeFilterCount}
            onPress={() => setFiltersOpen((open) => !open)}
          />
        </View>

        {filtersOpen && (
          <NotificationsFilterPanel
            value={filters}
            onApply={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        {notificationsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : notificationsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les notifications.
            </Text>
            <Pressable
              onPress={() => loadNotifications()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              <View className="flex-row items-center justify-between px-4 py-2">
                <Text className="text-xs text-gray-400">
                  {notificationsMeta
                    ? `${notificationsMeta.total} notification${notificationsMeta.total > 1 ? "s" : ""}`
                    : ""}
                </Text>

                <Pressable
                  onPress={handleMarkAllAsRead}
                  disabled={
                    unreadCount === 0 || markAllNotificationsAsReadIsPending
                  }
                  hitSlop={8}
                >
                  <Text
                    className={`text-xs font-medium ${
                      unreadCount === 0 || markAllNotificationsAsReadIsPending
                        ? "text-gray-300"
                        : "text-blue-600"
                    }`}
                  >
                    {markAllNotificationsAsReadIsPending
                      ? "En cours..."
                      : "Tout marquer comme lu"}
                  </Text>
                </Pressable>
              </View>
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Vous n&apos;avez aucune notification pour le moment.
                </Text>
              </View>
            }
            ListFooterComponent={
              notificationsIsFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator />
                </View>
              ) : null
            }
            onEndReached={() => {
              if (notificationsHasNextPage && !notificationsIsFetchingNextPage) {
                fetchNextNotifications();
              }
            }}
            onEndReachedThreshold={0.4}
            refreshing={notificationsIsRefetching}
            onRefresh={loadNotifications}
          />
        )}
      </View>
    </>
  );
}
