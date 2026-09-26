import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { formatDateTime } from "@/lib/format";
import {
  dismissOfflineItem,
  useIsOnline,
  useOfflineQueue,
  type OfflineQueueItem,
} from "@/lib/offline/use-offline-queue";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import {
  describeFailure,
  OFFLINE_ITEM_STATE_LABELS,
  OFFLINE_ITEM_TYPE_LABELS,
} from "./sync-labels";

const STATE_STYLES: Record<OfflineQueueItem["state"], { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  waiting: { icon: "cloud-offline-outline", color: "#6B7280" },
  sending: { icon: "cloud-upload-outline", color: "#2563EB" },
  failed: { icon: "alert-circle-outline", color: "#DC2626" },
};

function SyncItemRow({ item, onDismiss }: { item: OfflineQueueItem; onDismiss: () => void }) {
  const style = STATE_STYLES[item.state];

  return (
    <View className="px-4 py-3 border-b border-gray-100">
      <View className="flex-row items-start gap-3">
        <Ionicons name={style.icon} size={20} color={style.color} />
        <View className="flex-1">
          <Text className="text-xs font-semibold text-gray-500 uppercase">
            {OFFLINE_ITEM_TYPE_LABELS[item.name] ?? item.name}
          </Text>
          <Text className="text-sm text-black" numberOfLines={2}>
            {item.label}
          </Text>
          <Text className="text-xs mt-0.5" style={{ color: style.color }}>
            {OFFLINE_ITEM_STATE_LABELS[item.state]}
            {item.state === "sending" && item.failureCount > 0
              ? ` · essai ${item.failureCount + 1}`
              : ""}
          </Text>
          <Text className="text-xs text-gray-400 mt-0.5">
            Saisi le {formatDateTime(item.queuedAt)}
          </Text>

          {item.state === "failed" && (
            <View className="mt-2 p-2.5 rounded-lg bg-red-50">
              <Text className="text-xs text-red-700">{describeFailure(item.failure)}</Text>
            </View>
          )}
        </View>
      </View>

      {item.state === "failed" && (
        <View className="flex-row justify-end mt-2">
          <Pressable
            onPress={onDismiss}
            className="h-9 px-4 rounded-lg border border-gray-300 items-center justify-center"
          >
            <Text className="text-sm font-medium text-gray-700">Ignorer</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export function SyncScreen() {
  const queryClient = useQueryClient();
  const isOnline = useIsOnline();
  const items = useOfflineQueue();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Synchronisation",
          headerLeft: () => <DrawerMenuButton />,
        }}
      />

      <View className="flex-1 bg-white">
        <View
          className={`flex-row items-center gap-2 px-4 py-2.5 ${isOnline ? "bg-green-50" : "bg-amber-50"}`}
        >
          <Ionicons
            name={isOnline ? "cloud-done-outline" : "cloud-offline-outline"}
            size={16}
            color={isOnline ? "#15803D" : "#B45309"}
          />
          <Text className={`text-sm ${isOnline ? "text-green-700" : "text-amber-700"}`}>
            {isOnline
              ? "En ligne : les envois en attente partent automatiquement."
              : "Hors ligne : tes saisies sont gardées sur l'appareil."}
          </Text>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => String(item.mutationId)}
          renderItem={({ item }) => (
            <SyncItemRow
              item={item}
              onDismiss={() => dismissOfflineItem(queryClient, item.mutationId)}
            />
          )}
          ListEmptyComponent={
            <View className="items-center px-6 py-16">
              <Ionicons name="checkmark-circle-outline" size={40} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 text-center mt-3">
                Tout est synchronisé.
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}
