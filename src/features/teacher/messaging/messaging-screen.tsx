import { ComboBox } from "@/components/list/combo-box";
import type { ConversationTab } from "@/api/endpoints/conversation";
import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { useConversations } from "@/hooks/queries/items/conversation";
import { useServiceDesksMine } from "@/hooks/queries/items/service-desk";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ConversationRow } from "./conversation-row";

const TABS: { id: ConversationTab; label: string }[] = [
  { id: "pending", label: "À traiter" },
  { id: "all", label: "Tous les fils" },
];

export function MessagingScreen() {

  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);
  const [tab, setTab] = useState<ConversationTab>("all");

  const { serviceDesks, serviceDesksIsLoading } = useServiceDesksMine();

  // Auto-sélection quand l'enseignant n'appartient qu'à un seul guichet
  const deskId =
    selectedDeskId ??
    (serviceDesks.length === 1 ? serviceDesks[0].id : null);

  const {
    conversations,
    conversationsError,
    conversationsIsLoading,
    conversationsIsFetching,
    loadConversations,
  } = useConversations({ deskId, tab });

  return (
    <>
      <Stack.Screen
        options={{
          title: "Messagerie",
          headerLeft: () => <DrawerMenuButton />,
          headerRight: () =>
            deskId ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/teacher/messaging/new",
                    params: { deskId },
                  })
                }
                hitSlop={8}
              >
                <Ionicons name="add-outline" size={26} color="#000000" />
              </Pressable>
            ) : null,
        }}
      />

      <View className="flex-1 bg-white">
        <View className="px-4 pt-3 pb-2">
          <ComboBox
            label="Guichet"
            options={serviceDesks.map((desk) => ({
              id: desk.id,
              label: desk.pendingConversationsCount
                ? `${desk.name} (${desk.pendingConversationsCount})`
                : desk.name,
            }))}
            value={deskId}
            onChange={setSelectedDeskId}
            loading={serviceDesksIsLoading}
            emptyLabel="Vous n'êtes membre d'aucun guichet."
          />

          <View className="flex-row bg-gray-100 rounded-lg p-1">
            {TABS.map((t) => {
              const selected = tab === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTab(t.id)}
                  className={`flex-1 h-9 rounded-md items-center justify-center ${
                    selected ? "bg-white" : ""
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      selected ? "font-semibold text-black" : "text-gray-500"
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={conversationsIsFetching && !conversationsIsLoading}
              onRefresh={loadConversations}
            />
          }
        >
          {!serviceDesksIsLoading && serviceDesks.length === 0 ? (
            <View className="items-center justify-center px-6 py-16">
              <Text className="text-sm text-gray-400 text-center">
                Vous n&apos;êtes membre d&apos;aucun guichet.
              </Text>
            </View>
          ) : conversationsIsLoading ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator />
            </View>
          ) : conversationsError ? (
            <View className="items-center justify-center px-6 py-10 gap-3">
              <Text className="text-sm text-gray-500 text-center">
                Impossible de charger les conversations.
              </Text>
              <Pressable
                onPress={() => loadConversations()}
                className="h-10 px-4 rounded-lg bg-black items-center justify-center"
              >
                <Text className="text-white font-medium">Réessayer</Text>
              </Pressable>
            </View>
          ) : conversations.length === 0 ? (
            <View className="items-center justify-center px-6 py-16">
              <Text className="text-sm text-gray-400 text-center">
                Aucun fil de discussion.
              </Text>
            </View>
          ) : (
            conversations.map((conversation, index) => (
              <ConversationRow
                key={conversation.id}
                item={conversation}
                isFirst={index === 0}
              />
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}
