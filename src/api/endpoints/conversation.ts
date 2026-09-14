import { Conversation } from "@/utils/types/Conversation";
import { Document } from "@/utils/types/Document";
import { Message } from "@/utils/types/Message";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export type ConversationTab = "pending" | "all";

export async function index(
  api: AxiosInstance,
  deskId: string,
  tab: ConversationTab,
): Promise<Conversation[]> {
  const { data } = await api.get<ApiResponse<Conversation[]>>(
    `/service-desks/${deskId}/conversations`,
    { params: { tab } },
  );
  return data.data;
}

export async function show(
  api: AxiosInstance,
  id: string,
): Promise<Conversation> {
  const { data } = await api.get<ApiResponse<Conversation>>(
    `/conversations/${id}`,
  );
  return data.data;
}

export async function messages(
  api: AxiosInstance,
  conversationId: string,
): Promise<Message[]> {
  const { data } = await api.get<ApiResponse<Message[]>>(
    `/conversations/${conversationId}/messages`,
  );
  return data.data;
}

export interface SendMessagePayload {
  body: string | null;
  document_ids: string[];
}

export async function sendMessage(
  api: AxiosInstance,
  conversationId: string,
  payload: SendMessagePayload,
): Promise<Message> {
  const { data } = await api.post<ApiResponse<Message>>(
    `/conversations/${conversationId}/messages`,
    payload,
  );
  return data.data;
}

export async function markHandled(
  api: AxiosInstance,
  conversationId: string,
): Promise<Conversation> {
  const { data } = await api.post<ApiResponse<Conversation>>(
    `/conversations/${conversationId}/handled`,
  );
  return data.data;
}

interface AttachableDocumentFilters {
  mine?: boolean;
}

export async function attachableDocuments(
  api: AxiosInstance,
  deskId: string,
  filters: AttachableDocumentFilters,
): Promise<Document[]> {
  const { data } = await api.get<ApiResponse<Document[]>>(
    `/service-desks/${deskId}/attachable-documents`,
    { params: filters },
  );
  return data.data;
}

export interface CreateDeskConversationPayload {
  partyUserId: string;
  schoolYearId: string;
  body: string | null;
  documentIds: string[];
}

export async function createDeskConversation(
  api: AxiosInstance,
  serviceDeskId: string,
  payload: CreateDeskConversationPayload,
): Promise<Conversation> {
  const { data } = await api.post<ApiResponse<Conversation>>(
    `/service-desks/${serviceDeskId}/conversations`,
    {
      party_user_id: payload.partyUserId,
      school_year_id: payload.schoolYearId,
      body: payload.body,
      document_ids: payload.documentIds,
    },
  );
  return data.data;
}
