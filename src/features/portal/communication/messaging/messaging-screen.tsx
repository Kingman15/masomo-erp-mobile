import { usePortalConversations } from "@/hooks/queries/items/portal-conversation";
import type { PortalConversationDTO } from "@/utils/types/objects/PortalConversationDTO";
import { Stack, router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { ConversationRow } from "./conversation-row";

export function MessagingScreen() {
  const { selectedSchoolYear } = usePortalSelection();

  const filtersAreComplete = Boolean(selectedSchoolYear?.id);

  const {
    portalConversations,
    portalConversationsError,
    portalConversationsIsLoading,
    portalConversationsIsFetching,
    loadPortalConversations,
  } = usePortalConversations({
    filters: { schoolYearId: selectedSchoolYear?.id },
    enabled: filtersAreComplete,
  });

  const handlePressConversation = (conversation: PortalConversationDTO) => {
    router.push(
      `/portal/menu/communication/messaging/${conversation.counterpartDeskId}`,
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Messagerie" }} />

      <View className="flex-1 bg-white">
        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucune année scolaire sélectionnée
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez une année scolaire pour afficher la messagerie.
            </Text>
          </View>
        ) : portalConversationsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalConversationsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger la messagerie.
            </Text>
            <Pressable
              onPress={() => loadPortalConversations()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={portalConversationsIsFetching}
                onRefresh={() => void loadPortalConversations()}
              />
            }
          >
            {portalConversations.length === 0 ? (
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucun guichet joignable pour cette année scolaire.
                </Text>
              </View>
            ) : (
              portalConversations.map((conversation, index) => (
                <ConversationRow
                  key={conversation.counterpartDeskId}
                  item={conversation}
                  onPress={handlePressConversation}
                  isFirst={index === 0}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
