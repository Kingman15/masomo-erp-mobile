import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { formatDateTime } from "@/lib/format";
import { getOfflineFailure } from "@/lib/offline/offline-error";
import {
  payloadIgnoringConflicts,
  type OfflinePayloads,
} from "@/lib/offline/offline-mutations";
import {
  notifyQueued,
  useOfflineMutation,
} from "@/lib/offline/use-offline-mutation";
import {
  dismissOfflineItem,
  useIsOnline,
  useOfflineQueue,
  type OfflineQueueItem,
} from "@/lib/offline/use-offline-queue";
import { toastNotify } from "@/lib/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  describeFailure,
  OFFLINE_ITEM_STATE_LABELS,
  OFFLINE_ITEM_TYPE_LABELS,
} from "./sync-labels";

const STATE_STYLES: Record<
  OfflineQueueItem["state"],
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  waiting: { icon: "cloud-offline-outline", color: "#6B7280" },
  sending: { icon: "cloud-upload-outline", color: "#2563EB" },
  failed: { icon: "alert-circle-outline", color: "#DC2626" },
};

/**
 * Applique le reste d'un envoi refusé pour conflit, sans toucher aux lignes en conflit.
 * Nouvelle intention, donc nouvel envoi (nouvelle clé) ; l'envoi refusé est retiré une fois le nouveau accepté ou mis en file.
 */
function ResendIgnoringConflictsButton({
  item,
  payload,
}: {
  item: OfflineQueueItem;
  payload: OfflinePayloads[keyof OfflinePayloads];
}) {
  const queryClient = useQueryClient();
  const { submit, isPending } = useOfflineMutation(item.name);

  const resend = async () => {
    try {
      const result = await submit(payload, item.label, item.recordedAt);
      dismissOfflineItem(queryClient, item.mutationId);

      if (result.status === "queued") notifyQueued();
      else toastNotify(`Envoyé sans les conflits : ${item.label}`, "success");
    } catch (error) {
      toastNotify(describeFailure(getOfflineFailure(error)), "error");
    }
  };

  return (
    <Pressable
      onPress={() => void resend()}
      disabled={isPending}
      className={`h-9 px-4 rounded-lg items-center justify-center ${
        isPending ? "bg-gray-300" : "bg-black"
      }`}
    >
      {isPending ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className="text-sm font-medium text-white">
          Renvoyer en ignorant les conflits
        </Text>
      )}
    </Pressable>
  );
}

function SyncItemRow({
  item,
  onDismiss,
}: {
  item: OfflineQueueItem;
  onDismiss: () => void;
}) {
  const style = STATE_STYLES[item.state];
  const resendPayload =
    item.state === "failed"
      ? payloadIgnoringConflicts(
          item.name,
          item.payload as OfflinePayloads[typeof item.name],
          item.failure,
        )
      : null;

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
              <Text className="text-xs text-red-700">
                {describeFailure(item.failure)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {item.state === "failed" && (
        <View className="flex-row flex-wrap justify-end gap-2 mt-2">
          {resendPayload && (
            <ResendIgnoringConflictsButton
              item={item}
              payload={resendPayload}
            />
          )}
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
          <Text
            className={`text-sm ${isOnline ? "text-green-700" : "text-amber-700"}`}
          >
            {isOnline
              ? "En ligne : les envois en attente partent automatiquement."
              : "Hors ligne : vos saisies sont sauvegardées temporairement sur l'appareil."}
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
              <Ionicons
                name="checkmark-circle-outline"
                size={40}
                color="#9CA3AF"
              />
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
