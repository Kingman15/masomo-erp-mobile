import api from "@/api/client";
import {
  index,
  messages,
  sendMessage,
  show,
  type SendPortalMessagePayload,
} from "@/api/endpoints/portal-conversation";
import { portalConversationKeys } from "@/utils/query-keys/portal-conversation";
import type { Message } from "@/utils/types/Message";
import type { PortalConversationDTO } from "@/utils/types/objects/PortalConversationDTO";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

const MESSAGES_POLL_INTERVAL = 10_000;

interface UsePortalConversationsParams {
  filters: { schoolYearId?: string | null };
  enabled?: boolean;
}

export function usePortalConversations({
  filters,
  enabled = true,
}: UsePortalConversationsParams) {
  const query = useListQuery<PortalConversationDTO>({
    queryKey: portalConversationKeys.list(filters.schoolYearId),
    queryFn: () => index(api, filters),
    label: "Mes fils de discussion",
    enabled: enabled && Boolean(filters.schoolYearId),
  });

  return {
    portalConversations: query.data ?? [],
    portalConversationsError: query.error,
    portalConversationsIsLoading: query.isLoading,
    portalConversationsIsFetching: query.isFetching,
    loadPortalConversations: query.refetch,
  };
}

interface UsePortalConversationParams {
  deskId: string | null | undefined;
  schoolYearId: string | null | undefined;
}

export function usePortalConversation({
  deskId,
  schoolYearId,
}: UsePortalConversationParams) {
  const query = useSingletonQuery<PortalConversationDTO>({
    queryKey: portalConversationKeys.detail(deskId, schoolYearId),
    queryFn: () => show(api, deskId!, schoolYearId!),
    label: "Fil de discussion",
    staleTime: 0,
    gcTime: 0,
    enabled: Boolean(deskId && schoolYearId),
    // Seul moyen simple de garder les infos du fil à jour sans polling dédié
    refetchOnWindowFocus: true,
  });

  return {
    portalConversation: query.data,
    portalConversationIsLoading: query.isLoading,
    portalConversationError: query.error,
    loadPortalConversation: query.refetch,
  };
}

export function usePortalConversationMessages(
  conversationId: string | null | undefined,
) {
  const query = useQuery<Message[]>({
    queryKey: portalConversationKeys.messages(conversationId),
    queryFn: () => {
      if (!conversationId) return Promise.reject(new Error("ID is required"));
      return messages(api, conversationId);
    },
    // Fil virtuel (guichet jamais contacté) : conversationId est null tant qu'aucun message n'a été envoyé
    enabled: !!conversationId,
    refetchInterval: MESSAGES_POLL_INTERVAL,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    meta: { label: "Messages" },
  });

  return {
    portalMessages: query.data ?? [],
    portalMessagesIsLoading: query.isLoading,
    portalMessagesIsFetching: query.isFetching,
    portalMessagesError: query.error,
  };
}

interface UseSendPortalMessageParams {
  deskId: string | null | undefined;
  schoolYearId: string | null | undefined;
}

export function useSendPortalMessage({
  deskId,
  schoolYearId,
}: UseSendPortalMessageParams) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: Omit<SendPortalMessagePayload, "school_year_id">) => {
      if (!deskId || !schoolYearId) {
        return Promise.reject(new Error("deskId et schoolYearId sont requis"));
      }
      return sendMessage(api, deskId, {
        school_year_id: schoolYearId,
        ...payload,
      });
    },
    onSuccess: (conversation) => {
      queryClient.setQueryData(
        portalConversationKeys.detail(deskId, schoolYearId),
        conversation,
      );
      // conversation.id passe de null à une vraie valeur au tout premier envoi (fil virtuel devenu réel)
      void queryClient.invalidateQueries({
        queryKey: portalConversationKeys.messages(conversation.id),
      });
      void queryClient.invalidateQueries({
        queryKey: portalConversationKeys.list(schoolYearId),
      });
    },
  });

  return {
    sendPortalMessage: mutation.mutateAsync,
    sendPortalMessageIsPending: mutation.isPending,
  };
}
