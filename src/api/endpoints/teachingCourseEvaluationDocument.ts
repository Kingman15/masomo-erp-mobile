import {
  TeachingCourseEvaluationDocument,
  TeachingCourseEvaluationDocumentType,
} from "@/utils/types/TeachingCourseEvaluationDocument";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function index(
  api: AxiosInstance,
  evaluationId: string,
): Promise<TeachingCourseEvaluationDocument[]> {
  const { data } = await api.get<
    ApiResponse<TeachingCourseEvaluationDocument[]>
  >(`/teaching-course-evaluations/${evaluationId}/documents`);
  return data.data;
}

export interface UploadDocumentPayload {
  uri: string;
  name: string;
  mimeType: string;
  documentType?: TeachingCourseEvaluationDocumentType | null;
}

export async function store(
  api: AxiosInstance,
  evaluationId: string,
  payload: UploadDocumentPayload,
): Promise<TeachingCourseEvaluationDocument> {
  const formData = new FormData();
  formData.append("file", {
    uri: payload.uri,
    name: payload.name,
    type: payload.mimeType,
  } as unknown as Blob);
  if (payload.documentType) {
    formData.append("document_type", payload.documentType);
  }

  const { data } = await api.post<
    ApiResponse<TeachingCourseEvaluationDocument>
  >(`/teaching-course-evaluations/${evaluationId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function destroy(
  api: AxiosInstance,
  evaluationId: string,
  linkId: string,
): Promise<void> {
  await api.delete(
    `/teaching-course-evaluations/${evaluationId}/documents/${linkId}`,
  );
}
