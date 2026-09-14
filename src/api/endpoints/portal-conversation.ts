import { Message } from "@/utils/types/Message";
import { PortalConversationDTO } from "@/utils/types/objects/PortalConversationDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface PortalConversationFilters {
  schoolYearId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: PortalConversationFilters,
): Promise<PortalConversationDTO[]> {
  const { data } = await api.get<ApiResponse<PortalConversationDTO[]>>(
    "/portal/conversations",
    { params: { schoolYearId: filters.schoolYearId ?? undefined } },
  );
  return data.data;
}

export async function show(
  api: AxiosInstance,
  serviceDeskId: string,
  schoolYearId: string,
): Promise<PortalConversationDTO> {
  const { data } = await api.get<ApiResponse<PortalConversationDTO>>(
    `/portal/service-desks/${serviceDeskId}/conversation`,
    { params: { schoolYearId } },
  );
  return data.data;
}

export async function messages(
  api: AxiosInstance,
  conversationId: string,
): Promise<Message[]> {
  const { data } = await api.get<ApiResponse<Message[]>>(
    `/portal/conversations/${conversationId}/messages`,
  );
  return data.data;
}

export interface SendPortalMessagePayload {
  school_year_id: string;
  body: string | null;
  document_ids: string[];
}

export async function sendMessage(
  api: AxiosInstance,
  serviceDeskId: string,
  payload: SendPortalMessagePayload,
): Promise<PortalConversationDTO> {
  const { data } = await api.post<ApiResponse<PortalConversationDTO>>(
    `/portal/service-desks/${serviceDeskId}/messages`,
    payload,
  );
  return data.data;
}
