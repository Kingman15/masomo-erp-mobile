import { TeachingCourseEvaluationResultFormValues } from "@/utils/schemas/teaching-course-evaluation-result-schema";
import { TeachingCourseEvaluationResultRosterEntry } from "@/utils/types/TeachingCourseEvaluationResult";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function getByEvaluation(
  api: AxiosInstance,
  evaluationId: string,
): Promise<TeachingCourseEvaluationResultRosterEntry[]> {
  const { data } = await api.get<
    ApiResponse<TeachingCourseEvaluationResultRosterEntry[]>
  >(`/teaching-course-evaluation-results/get-by-evaluation/${evaluationId}`);
  return data.data;
}

export async function save(
  api: AxiosInstance,
  payload: TeachingCourseEvaluationResultFormValues,
): Promise<void> {
  await api.post("/teaching-course-evaluation-results", {
    evaluation_id: payload.evaluationId,
    results: payload.results.map((result) => ({
      enrollment_id: result.enrollmentId,
      score: result.score ?? null,
    })),
  });
}

export async function exportResults(
  api: AxiosInstance,
  evaluationId: string,
): Promise<ArrayBuffer> {
  const { data } = await api.get<ArrayBuffer>(
    `/teaching-course-evaluation-results/export/${evaluationId}`,
    { responseType: "arraybuffer" },
  );
  return data;
}

export async function importResults(
  api: AxiosInstance,
  evaluationId: string,
  file: { uri: string; name: string; mimeType: string },
): Promise<TeachingCourseEvaluationResultRosterEntry[]> {
  const formData = new FormData();
  // React Native FormData accepte un objet { uri, name, type } comme fichier.
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);

  const { data } = await api.post<
    ApiResponse<TeachingCourseEvaluationResultRosterEntry[]>
  >(`/teaching-course-evaluation-results/import/${evaluationId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}
