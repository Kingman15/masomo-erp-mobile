import { Document } from "@/utils/types/Document";
import { PortalDocumentDTO } from "@/utils/types/objects/PortalDocumentDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface PortalDocumentFilters {
  schoolYearId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: PortalDocumentFilters,
): Promise<PortalDocumentDTO[]> {
  const { data } = await api.get<ApiResponse<PortalDocumentDTO[]>>(
    "/portal/documents",
    { params: { schoolYearId: filters.schoolYearId ?? undefined } },
  );
  return data.data;
}

export async function show(
  api: AxiosInstance,
  documentId: string,
  schoolYearId: string,
): Promise<PortalDocumentDTO> {
  const { data } = await api.get<ApiResponse<PortalDocumentDTO>>(
    `/portal/documents/${documentId}`,
    { params: { schoolYearId } },
  );
  return data.data;
}

export async function attachable(
  api: AxiosInstance,
): Promise<PortalDocumentDTO[]> {
  const { data } = await api.get<ApiResponse<PortalDocumentDTO[]>>(
    "/portal/attachable-documents",
  );
  return data.data;
}

export interface CreatePortalDocumentUploadPayload {
  uri: string;
  name: string;
  mimeType: string;
  schoolYearId?: string | null;
  title?: string | null;
}

export async function storeUpload(
  api: AxiosInstance,
  payload: CreatePortalDocumentUploadPayload,
): Promise<Document> {
  const formData = new FormData();

  formData.append("file", {
    uri: payload.uri,
    name: payload.name,
    type: payload.mimeType,
  } as unknown as Blob);
  if (payload.schoolYearId) {
    formData.append("school_year_id", payload.schoolYearId);
  }
  if (payload.title) formData.append("title", payload.title);

  const { data } = await api.post<ApiResponse<Document>>(
    "/portal/document-uploads",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data;
}
