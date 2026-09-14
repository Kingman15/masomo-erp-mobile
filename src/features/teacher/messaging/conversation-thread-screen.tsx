import {
  useConversationById,
  useConversationMessages,
  useMarkConversationHandled,
  useSendMessage,
} from "@/hooks/queries/items/conversation";
import { useServiceDesksMine } from "@/hooks/queries/items/service-desk";
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
import { ConversationStatusPill } from "./conversation-status-pill";
import { MessageAttachments } from "./message-attachments";
import { MessageComposer } from "./message-composer";
import { PartyAvatar } from "./party-avatar";

function MessageBubble({ message }: { message: Message }) {
  const isSchool = message.sentAsDeskId !== null;
  const senderLabel = isSchool
    ? [message.sentAsDesk?.name, message.sender?.name]
        .filter(Boolean)
        .join(" · ")
    : (message.sender?.name ?? "");

  return (
    <View
      className={`flex-row items-end gap-2 mb-3 ${isSchool ? "flex-row-reverse" : ""}`}
    >
      <PartyAvatar
        name={isSchool ? message.sentAsDesk?.name : message.sender?.name}
        size={28}
      />

      <View className={`flex-1 ${isSchool ? "items-end" : "items-start"}`}>
        <View
          className={`max-w-[85%] rounded-lg px-3 py-2 ${
            isSchool ? "bg-black" : "bg-gray-100"
          }`}
        >
          {senderLabel ? (
            <Text
              className={`text-xs mb-1 ${isSchool ? "text-gray-300" : "text-gray-500"}`}
            >
              {senderLabel}
            </Text>
          ) : null}
          {message.body ? (
            <Text
              className={`text-sm ${isSchool ? "text-white" : "text-black"}`}
            >
              {message.body}
            </Text>
          ) : null}
          <MessageAttachments
            documents={message.documents}
            tint={isSchool ? "dark" : "light"}
          />
        </View>
        <Text className="text-[10px] text-gray-400 mt-1">
          {formatDateTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export function ConversationThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollRef = useRef<ScrollView>(null);

  const [body, setBody] = useState("");
  const [documents, setDocuments] = useState<MessageDocumentDraft[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);

  const { conversation, conversationIsLoading, conversationError } =
    useConversationById(id);
  const { messages, messagesIsLoading } = useConversationMessages(id);
  const { serviceDesks } = useServiceDesksMine();
  const { sendMessage, sendMessageIsPending } = useSendMessage(id);
  const { markConversationHandled, markConversationHandledIsPending } =
    useMarkConversationHandled(id);

  const membership = serviceDesks.find(
    (desk) => desk.id === conversation?.counterpartDeskId,
  );
  const canReply = membership?.canReply !== false;

  const handleSend = async () => {
    if (!body.trim() && documents.length === 0) return;
    setSendError(null);
    try {
      await sendMessage({
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

  const handleMarkHandled = async () => {
    try {
      await markConversationHandled();
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View className="flex-row items-center gap-2">
              <PartyAvatar name={conversation?.party?.name} size={32} />
              <View>
                <Text
                  className="text-sm font-semibold text-black"
                  numberOfLines={1}
                >
                  {conversation?.party?.name ?? "—"}
                </Text>
                <Text className="text-xs text-gray-500" numberOfLines={1}>
                  {conversation?.serviceDesk?.name ?? "Guichet"}
                </Text>
              </View>
            </View>
          ),
          headerRight: () =>
            conversation ? (
              <View className="flex-row items-center gap-2">
                <ConversationStatusPill
                  awaitingSchoolReply={conversation.awaitingSchoolReply}
                />
                {conversation.awaitingSchoolReply && (
                  <Pressable
                    onPress={() => void handleMarkHandled()}
                    disabled={markConversationHandledIsPending}
                    hitSlop={8}
                  >
                    {markConversationHandledIsPending ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={24}
                        color="#000000"
                      />
                    )}
                  </Pressable>
                )}
              </View>
            ) : null,
        }}
      />

      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {conversationIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : conversationError || !conversation ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-sm text-gray-500 text-center">
              Ce fil n&apos;existe pas ou vous n&apos;y avez pas accès.
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
              {messagesIsLoading ? (
                <Text className="text-center text-sm text-gray-400 py-4">
                  Chargement des messages…
                </Text>
              ) : messages.length === 0 ? (
                <Text className="text-center text-sm text-gray-400 py-4">
                  Aucun message pour l&apos;instant.
                </Text>
              ) : (
                messages.map((message) => (
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
              disabled={!canReply || sendMessageIsPending}
              disabledReason={
                !canReply
                  ? "Vous êtes observateur sur ce guichet : vous ne pouvez pas répondre."
                  : null
              }
              deskId={conversation.counterpartDeskId}
              schoolYearId={conversation.schoolYearId}
              placeholder={canReply ? "Écrire un message…" : "Réponse désactivée"}
              trailing={
                <Pressable
                  onPress={() => void handleSend()}
                  disabled={
                    !canReply ||
                    (!body.trim() && documents.length === 0) ||
                    sendMessageIsPending
                  }
                  className={`h-10 w-10 rounded-full items-center justify-center ${
                    !canReply ||
                    (!body.trim() && documents.length === 0) ||
                    sendMessageIsPending
                      ? "bg-gray-200"
                      : "bg-black"
                  }`}
                >
                  {sendMessageIsPending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons
                      name="arrow-up"
                      size={20}
                      color={
                        !canReply || (!body.trim() && documents.length === 0)
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
