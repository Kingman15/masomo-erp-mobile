import {
  TeachingCourseEvaluationCountsTowardsFinalFormValues,
  TeachingCourseEvaluationFormValues,
  TeachingCourseEvaluationPublishFormValues,
} from "@/utils/schemas/teaching-course-evaluation-schema";
import { TeachingCourseEvaluation } from "@/utils/types/TeachingCourseEvaluation";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";
import PaginatedApiResponse from "../responses/PaginatedApiResponse";
import { PortalTeachingCourseEvaluationDTO } from "@/utils/types/objects/PortalTeachingCourseEvaluationDTO";

interface TeachingCourseEvaluationFilters {
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  courseId?: string | null;
  evaluationPeriodId?: string | null;
  teachingCourseEvaluationTypeId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface PortalTeachingCourseEvaluationFilters {
  schoolYearId?: string;
  schoolClassId?: string;
  evaluationPeriodId?: string;
  courseId?: string;
}

export async function index(
  api: AxiosInstance,
  filters: TeachingCourseEvaluationFilters,
  page: number,
  perPage: number | "all",
): Promise<PaginatedApiResponse<TeachingCourseEvaluation>> {
  const { data } = await api.get<
    PaginatedApiResponse<TeachingCourseEvaluation>
  >("/teaching-course-evaluations", { params: { ...filters, page, perPage } });
  return data;
}

export async function portalIndex(
  api: AxiosInstance,
  studentId: string,
  filters: PortalTeachingCourseEvaluationFilters,
): Promise<PortalTeachingCourseEvaluationDTO[]> {
  const { data } = await api.get<
    ApiResponse<PortalTeachingCourseEvaluationDTO[]>
  >(`/portal/students/${studentId}/teaching-course-evaluations`, {
    params: filters,
  });

  return data.data;
}

export async function portalShow(
  api: AxiosInstance,
  studentId: string,
  evaluationId: string,
): Promise<PortalTeachingCourseEvaluationDTO> {
  const { data } = await api.get<ApiResponse<PortalTeachingCourseEvaluationDTO>>(
    `/portal/students/${studentId}/teaching-course-evaluations/${evaluationId}`,
  );

  return data.data;
}

function toRequestBody(payload: TeachingCourseEvaluationFormValues) {
  return {
    school_year_id: payload.schoolYearId,
    school_class_id: payload.schoolClassId,
    course_id: payload.courseId,
    evaluation_type_id: payload.evaluationTypeId,
    evaluation_period_id: payload.evaluationPeriodId,
    weight: payload.weight,
    max_score: payload.maxScore,
    evaluation_date: payload.evaluationDate,
    due_date: payload.dueDate ?? null,
    wording: payload.wording,
    comments: payload.comments ?? null,
    counts_towards_final: payload.countsTowardsFinal,
    is_visible_to_guardians: payload.isVisibleToGuardians,
    is_visible_to_students: payload.isVisibleToStudents,
    publish: payload.publish ?? false,
    questions: payload.questions.map((question) => ({
      id: question.id ?? undefined,
      question_no: question.questionNo,
      question_type: question.questionType,
      question_text: question.questionText,
      weight: question.weight,
      correct_answer:
        question.correctAnswerText ||
        (question.correctAnswerKeywords &&
          question.correctAnswerKeywords.length > 0)
          ? {
              answer_text: question.correctAnswerText ?? null,
              keywords: question.correctAnswerKeywords ?? [],
            }
          : null,
      is_required: true,
      is_active: true,
      comments: question.comments ?? null,
      _delete: question.isDeleted ? true : undefined,
    })),
  };
}

export async function show(
  api: AxiosInstance,
  id: string,
): Promise<TeachingCourseEvaluation> {
  const { data } = await api.get<ApiResponse<TeachingCourseEvaluation>>(
    `/teaching-course-evaluations/${id}`,
  );
  return data.data;
}

export async function store(
  api: AxiosInstance,
  payload: TeachingCourseEvaluationFormValues,
): Promise<TeachingCourseEvaluation> {
  const { data } = await api.post<ApiResponse<TeachingCourseEvaluation>>(
    "/teaching-course-evaluations",
    toRequestBody(payload),
  );
  return data.data;
}

export async function update(
  api: AxiosInstance,
  id: string,
  payload: TeachingCourseEvaluationFormValues,
): Promise<TeachingCourseEvaluation> {
  const { data } = await api.put<ApiResponse<TeachingCourseEvaluation>>(
    `/teaching-course-evaluations/${id}`,
    toRequestBody(payload),
  );
  return data.data;
}

export async function destroy(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/teaching-course-evaluations/${id}`);
}

export async function publish(
  api: AxiosInstance,
  id: string,
  payload: TeachingCourseEvaluationPublishFormValues,
): Promise<TeachingCourseEvaluation> {
  const { data } = await api.post<ApiResponse<TeachingCourseEvaluation>>(
    `/teaching-course-evaluations/${id}/publish`,
    { due_date: payload.dueDate ?? null },
  );
  return data.data;
}

export async function updateCountsTowardsFinal(
  api: AxiosInstance,
  id: string,
  payload: TeachingCourseEvaluationCountsTowardsFinalFormValues,
): Promise<TeachingCourseEvaluation> {
  const { data } = await api.put<ApiResponse<TeachingCourseEvaluation>>(
    `/teaching-course-evaluations/${id}/counts-towards-final`,
    {
      counts_towards_final: payload.countsTowardsFinal,
      exclusion_reason: payload.countsTowardsFinal
        ? null
        : (payload.exclusionReason?.trim() ?? null),
    },
  );
  return data.data;
}
