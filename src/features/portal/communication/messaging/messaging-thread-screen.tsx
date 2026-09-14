import { MessageAttachments } from "@/features/teacher/messaging/message-attachments";
import { PartyAvatar } from "@/features/teacher/messaging/party-avatar";
import {
  usePortalConversation,
  usePortalConversationMessages,
  useSendPortalMessage,
} from "@/hooks/queries/items/portal-conversation";
import { handleApiError } from "@/lib/handle-api-error";
import { formatDateTime } from "@/lib/format";
import type { Message } from "@/utils/types/Message";
import type { MessageDocumentDraft } from "@/utils/types/MessageDocument";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { MessageComposer } from "./message-composer";

function MessageBubble({ message }: { message: Message }) {
  const isSchool = message.sentAsDeskId !== null;
  const senderLabel = isSchool
    ? message.sentAsDesk?.name
    : (message.sender?.name ?? "");

  return (
    <View
      className={`flex-row items-end gap-2 mb-3 ${isSchool ? "" : "flex-row-reverse"}`}
    >
      <PartyAvatar
        name={isSchool ? message.sentAsDesk?.name : message.sender?.name}
        size={28}
      />

      <View className={`flex-1 ${isSchool ? "items-start" : "items-end"}`}>
        <View
          className={`max-w-[85%] rounded-lg px-3 py-2 ${
            isSchool ? "bg-gray-100" : "bg-black"
          }`}
        >
          {senderLabel ? (
            <Text
              className={`text-xs mb-1 ${isSchool ? "text-gray-500" : "text-gray-300"}`}
            >
              {senderLabel}
            </Text>
          ) : null}
          {message.body ? (
            <Text
              className={`text-sm ${isSchool ? "text-black" : "text-white"}`}
            >
              {message.body}
            </Text>
          ) : null}
          <MessageAttachments
            documents={message.documents}
            tint={isSchool ? "light" : "dark"}
          />
        </View>
        <Text className="text-[10px] text-gray-400 mt-1">
          {formatDateTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export function MessagingThreadScreen() {
  const { id: deskId } = useLocalSearchParams<{ id: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const { selectedSchoolYear } = usePortalSelection();

  const [body, setBody] = useState("");
  const [documents, setDocuments] = useState<MessageDocumentDraft[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);

  const {
    portalConversation,
    portalConversationIsLoading,
    portalConversationError,
  } = usePortalConversation({
    deskId,
    schoolYearId: selectedSchoolYear?.id,
  });

  const { portalMessages, portalMessagesIsLoading } =
    usePortalConversationMessages(portalConversation?.id);

  const { sendPortalMessage, sendPortalMessageIsPending } =
    useSendPortalMessage({ deskId, schoolYearId: selectedSchoolYear?.id });

  const handleSend = async () => {
    if (!body.trim() && documents.length === 0) return;
    setSendError(null);
    try {
      await sendPortalMessage({
        body: body.trim() || null,
        document_ids: documents.map((d) => d.documentId),
      });
      setBody("");
      setDocuments([]);
    } catch (error) {
      handleApiError(error, {
        setFieldError: (_field, message) => setSendError(message),
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: portalConversation?.serviceDesk?.name ?? "Messagerie",
        }}
      />

      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {portalConversationIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalConversationError || !portalConversation ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger ce guichet.
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              className="flex-1"
              contentContainerStyle={{ padding: 16 }}
              onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({ animated: true })
              }
            >
              {portalMessagesIsLoading ? (
                <Text className="text-center text-sm text-gray-400 py-4">
                  Chargement des messages…
                </Text>
              ) : portalMessages.length === 0 ? (
                <Text className="text-center text-sm text-gray-400 py-4">
                  Aucun message pour l&apos;instant — écrivez le premier.
                </Text>
              ) : (
                portalMessages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
            </ScrollView>

            {sendError && (
              <Text className="px-4 pb-1 text-xs text-red-500">
                {sendError}
              </Text>
            )}

            <MessageComposer
              body={body}
              onBodyChange={setBody}
              documents={documents}
              onDocumentsChange={setDocuments}
              disabled={sendPortalMessageIsPending}
              schoolYearId={selectedSchoolYear?.id}
              placeholder="Écrire un message…"
              trailing={
                <Pressable
                  onPress={() => void handleSend()}
                  disabled={
                    (!body.trim() && documents.length === 0) ||
                    sendPortalMessageIsPending
                  }
                  className={`h-10 w-10 rounded-full items-center justify-center ${
                    (!body.trim() && documents.length === 0) ||
                    sendPortalMessageIsPending
                      ? "bg-gray-200"
                      : "bg-black"
                  }`}
                >
                  {sendPortalMessageIsPending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons
                      name="arrow-up"
                      size={20}
                      color={
                        !body.trim() && documents.length === 0
                          ? "#9CA3AF"
                          : "#FFFFFF"
                      }
                    />
                  )}
                </Pressable>
              }
            />
          </>
        )}
      </KeyboardAvoidingView>
    </>
  );
}
