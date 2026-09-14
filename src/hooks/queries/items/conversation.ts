import api from "@/api/client";
import {
  attachableDocuments,
  createDeskConversation,
  index,
  markHandled,
  messages,
  sendMessage,
  show,
  type ConversationTab,
  type CreateDeskConversationPayload,
  type SendMessagePayload,
} from "@/api/endpoints/conversation";
import { toastNotify } from "@/lib/toast";
import { conversationKeys } from "@/utils/query-keys/conversation";
import { Conversation } from "@/utils/types/Conversation";
import { Document } from "@/utils/types/Document";
import { Message } from "@/utils/types/Message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDetailQuery } from "../use-detail-query";
import { useListQuery } from "../use-list-query";

const MESSAGES_POLL_INTERVAL = 10_000;

interface UseConversationsParams {
  deskId: string | null | undefined;
  tab: ConversationTab;
  enabled?: boolean;
}

export function useConversations({
  deskId,
  tab,
  enabled = true,
}: UseConversationsParams) {
  const query = useListQuery<Conversation>({
    queryKey: conversationKeys.list(deskId, tab),
    queryFn: () => {
      if (!deskId) return Promise.reject(new Error("deskId is required"));
      return index(api, deskId, tab);
    },
    label: "Fils de discussion",
    enabled: enabled && Boolean(deskId),
  });

  return {
    conversations: query.data ?? [],
    conversationsError: query.error,
    conversationsIsLoading: query.isLoading,
    conversationsIsFetching: query.isFetching,
    loadConversations: query.refetch,
  };
}

export function useConversationById(id: string | undefined) {
  const query = useDetailQuery<Conversation>({
    queryKey: conversationKeys.detail(id),
    queryFn: () => {
      if (!id) return Promise.reject(new Error("ID is required"));
      return show(api, id);
    },
    label: "Fil de discussion",
    id,
    staleTime: 0,
    gcTime: 0,
    // Seul moyen simple de garder awaitingSchoolReply à jour sans polling dédié
    refetchOnWindowFocus: true,
  });

  return {
    conversation: query.data,
    conversationIsLoading: query.isLoading,
    conversationError: query.error,
    loadConversation: query.refetch,
  };
}

export function useConversationMessages(conversationId: string | undefined) {
  const query = useQuery<Message[]>({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => {
      if (!conversationId) {
        return Promise.reject(new Error("ID is required"));
      }
      return messages(api, conversationId);
    },
    enabled: !!conversationId,
    refetchInterval: MESSAGES_POLL_INTERVAL,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    meta: { label: "Messages" },
  });

  return {
    messages: query.data ?? [],
    messagesIsLoading: query.isLoading,
    messagesIsFetching: query.isFetching,
    messagesError: query.error,
  };
}

export function useSendMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: SendMessagePayload) => {
      if (!conversationId) {
        return Promise.reject(new Error("ID is required"));
      }
      return sendMessage(api, conversationId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: conversationKeys.messages(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(conversationId),
      });
    },
  });

  return {
    sendMessage: mutation.mutateAsync,
    sendMessageIsPending: mutation.isPending,
  };
}

export function useMarkConversationHandled(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!conversationId) {
        return Promise.reject(new Error("ID is required"));
      }
      return markHandled(api, conversationId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      toastNotify("Fil marqué comme traité.", "success");
    },
  });

  return {
    markConversationHandled: mutation.mutateAsync,
    markConversationHandledIsPending: mutation.isPending,
  };
}

interface UseAttachableDocumentsParams {
  deskId: string | null | undefined;
  mine?: boolean;
  enabled?: boolean;
}

export function useAttachableDocuments({
  deskId,
  mine,
  enabled = true,
}: UseAttachableDocumentsParams) {
  const query = useListQuery<Document>({
    queryKey: conversationKeys.attachableDocuments(deskId, { mine }),
    queryFn: () => {
      if (!deskId) return Promise.reject(new Error("deskId is required"));
      return attachableDocuments(api, deskId, { mine });
    },
    label: "Documents joignables",
    enabled: enabled && Boolean(deskId),
  });

  return {
    attachableDocuments: query.data ?? [],
    attachableDocumentsError: query.error,
    attachableDocumentsIsLoading: query.isLoading,
    loadAttachableDocuments: query.refetch,
  };
}

export function useCreateDeskConversation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      serviceDeskId,
      payload,
    }: {
      serviceDeskId: string;
      payload: CreateDeskConversationPayload;
    }) => createDeskConversation(api, serviceDeskId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });

  return {
    createDeskConversation: mutation.mutateAsync,
    createDeskConversationIsPending: mutation.isPending,
  };
}
