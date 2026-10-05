import { TeachingCourseEvaluationResultFormValues } from "@/utils/schemas/teaching-course-evaluation-result-schema";
import {
  TeachingCourseEvaluationResultRosterEntry,
  TeachingCourseEvaluationResultStatus,
} from "@/utils/types/TeachingCourseEvaluationResult";
import { AxiosInstance } from "axios";
import { toRequestConfig, type WriteRequestOptions } from "../idempotency";
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

// reject : 409 GRADES_CONFLICT et rien d'écrit si une note a changé sur le serveur ; skip_conflicts : ces notes sont laissées telles quelles, les autres enregistrées.
export type GradesConflictStrategy = "reject" | "skip_conflicts";

export interface TeachingCourseEvaluationResultPayload
  extends TeachingCourseEvaluationResultFormValues {
  conflictStrategy?: GradesConflictStrategy;
}

export interface TeachingCourseEvaluationResultSaveResult {
  saved: {
    enrollment_id: string;
    id: string;
    status: TeachingCourseEvaluationResultStatus | null;
    updated_at: string | null;
  }[];
  // Modifiées sur le serveur depuis le chargement, laissées telles quelles (skip_conflicts).
  skipped: { enrollment_id: string }[];
}

export async function save(
  api: AxiosInstance,
  payload: TeachingCourseEvaluationResultPayload,
  options?: WriteRequestOptions,
): Promise<TeachingCourseEvaluationResultSaveResult> {
  const { data } = await api.post<
    ApiResponse<TeachingCourseEvaluationResultSaveResult>
  >(
    "/teaching-course-evaluation-results",
    {
      evaluation_id: payload.evaluationId,
      conflict_strategy: payload.conflictStrategy,
      results: payload.results.map((result) => ({
        enrollment_id: result.enrollmentId,
        score: result.score ?? null,
        // undefined : clé omise, pas de contrôle ; null : « aucune note n'existait ».
        expected_updated_at: result.expectedUpdatedAt,
      })),
    },
    toRequestConfig(options),
  );
  return data.data;
}

// Brouillon -> soumis (pour approbation). En ligne uniquement : pas de file offline.
export async function submit(
  api: AxiosInstance,
  evaluationId: string,
  resultIds: string[],
): Promise<void> {
  await api.post(`/teaching-course-evaluation-results/submit/${evaluationId}`, {
    resultIds,
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
