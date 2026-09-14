import { Document } from "@/utils/types/Document";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface DocumentFilters {
  schoolYearId?: string | null;
  audienceType?: string | null;
  audienceId?: string | null;
  search?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: DocumentFilters,
): Promise<Document[]> {
  const { data } = await api.get<ApiResponse<Document[]>>("/documents", {
    params: filters,
  });
  return data.data;
}

export async function show(
  api: AxiosInstance,
  id: string,
): Promise<Document> {
  const { data } = await api.get<ApiResponse<Document>>(`/documents/${id}`);
  return data.data;
}

export interface CreateDocumentSharePayload {
  audienceType: string;
  audienceId?: string | null;
  publishedAt?: string | null;
  expiresAt?: string | null;
}

export interface CreateDocumentPayload {
  uri: string;
  name: string;
  mimeType: string;
  title: string;
  description?: string | null;
  category?: string | null;
  schoolYearId?: string | null;
  shares: CreateDocumentSharePayload[];
}

export async function store(
  api: AxiosInstance,
  payload: CreateDocumentPayload,
): Promise<Document> {
  const formData = new FormData();

  formData.append("file", {
    uri: payload.uri,
    name: payload.name,
    type: payload.mimeType,
  } as unknown as Blob);
  formData.append("title", payload.title);
  if (payload.description) {
    formData.append("description", payload.description);
  }
  if (payload.category) formData.append("category", payload.category);
  if (payload.schoolYearId) {
    formData.append("school_year_id", payload.schoolYearId);
  }

  payload.shares.forEach((share, index) => {
    formData.append(`shares[${index}][audience_type]`, share.audienceType);
    if (share.audienceId) {
      formData.append(`shares[${index}][audience_id]`, share.audienceId);
    }
    if (share.publishedAt) {
      formData.append(`shares[${index}][published_at]`, share.publishedAt);
    }
    if (share.expiresAt) {
      formData.append(`shares[${index}][expires_at]`, share.expiresAt);
    }
  });

  const { data } = await api.post<ApiResponse<Document>>(
    "/documents",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data;
}

export interface CreateDocumentUploadPayload {
  uri: string;
  name: string;
  mimeType: string;
  schoolYearId?: string | null;
  title?: string | null;
  category?: string | null;
  description?: string | null;
}

// Téléversement simple, sans partage (distinct de store()/"Partager un
// document") — utilisé pour joindre un nouveau fichier à un message.
export async function storeUpload(
  api: AxiosInstance,
  payload: CreateDocumentUploadPayload,
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
  if (payload.category) formData.append("category", payload.category);
  if (payload.description) {
    formData.append("description", payload.description);
  }

  const { data } = await api.post<ApiResponse<Document>>(
    "/document-uploads",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data;
}
