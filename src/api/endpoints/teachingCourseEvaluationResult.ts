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
