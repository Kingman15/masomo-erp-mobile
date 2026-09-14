import { useCreateDeskConversation } from "@/hooks/queries/items/conversation";
import { useServiceDesksMine } from "@/hooks/queries/items/service-desk";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import type { MessageDocumentDraft } from "@/utils/types/MessageDocument";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { MessageComposer } from "./message-composer";
import { PartyPicker, type SelectedParty } from "./party-picker";

export function NewConversationScreen() {
  const { deskId } = useLocalSearchParams<{ deskId: string }>();

  const [party, setParty] = useState<SelectedParty | null>(null);
  const [body, setBody] = useState("");
  const [documents, setDocuments] = useState<MessageDocumentDraft[]>([]);

  const { serviceDesks, serviceDesksIsLoading } = useServiceDesksMine();
  const { currentSchoolYear } = useCurrentSchoolYear();
  const { createDeskConversation, createDeskConversationIsPending } =
    useCreateDeskConversation();

  const serviceDesk = serviceDesks.find((desk) => desk.id === deskId);
  const schoolYearId = currentSchoolYear?.id;

  const canSubmit =
    !!party?.partyUserId &&
    !!schoolYearId &&
    (body.trim().length > 0 || documents.length > 0) &&
    !createDeskConversationIsPending;

  const handleSubmit = async () => {
    if (!party?.partyUserId || !schoolYearId || !deskId) return;

    try {
      const conversation = await createDeskConversation({
        serviceDeskId: deskId,
        payload: {
          partyUserId: party.partyUserId,
          schoolYearId,
          body: body.trim() || null,
          documentIds: documents.map((d) => d.documentId),
        },
      });
      toastNotify("Message envoyé avec succès.", "success");
      router.replace(`/teacher/messaging/${conversation.id}`);
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: serviceDesk ? `Nouveau message — ${serviceDesk.name}` : "Nouveau message",
        }}
      />

      <View className="flex-1 bg-white">
        {serviceDesksIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : !serviceDesk ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-sm text-gray-500 text-center">
              Guichet introuvable.
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ padding: 16 }}
            >
              <PartyPicker
                serviceDesk={serviceDesk}
                schoolYearId={schoolYearId}
                value={party}
                onChange={setParty}
              />
            </ScrollView>

            <MessageComposer
              body={body}
              onBodyChange={setBody}
              documents={documents}
              onDocumentsChange={setDocuments}
              deskId={deskId}
              schoolYearId={schoolYearId}
            />

            <View className="px-3 pb-3">
              <Pressable
                onPress={() => void handleSubmit()}
                disabled={!canSubmit}
                className={`h-11 rounded-lg items-center justify-center ${
                  canSubmit ? "bg-black" : "bg-gray-200"
                }`}
              >
                {createDeskConversationIsPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text
                    className={`font-medium ${canSubmit ? "text-white" : "text-gray-400"}`}
                  >
                    Envoyer
                  </Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </View>
    </>
  );
}
