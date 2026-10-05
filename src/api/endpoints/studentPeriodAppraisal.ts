import type {
  AppraisalMention,
  AppraisalMentionValue,
  StudentPeriodAppraisalBulkResult,
  StudentPeriodAppraisalGridRow,
} from "@/utils/types/StudentPeriodAppraisal";
import { AxiosInstance } from "axios";
import { toRequestConfig, type WriteRequestOptions } from "../idempotency";
import ApiResponse from "../responses/ApiResponse";

export interface StudentPeriodAppraisalGridFilters {
  schoolClassId: string;
  schoolYearId: string;
  schoolPeriodId: string;
}

// Grille de saisie d'une classe pour une période (titulaire de la classe : StudentPeriodAppraisalPolicy::manage côté API).
export async function grid(
  api: AxiosInstance,
  filters: StudentPeriodAppraisalGridFilters,
): Promise<StudentPeriodAppraisalGridRow[]> {
  const { data } = await api.get<ApiResponse<StudentPeriodAppraisalGridRow[]>>(
    "/student-period-appraisals",
    { params: filters },
  );
  return data.data;
}

export async function mentions(api: AxiosInstance): Promise<AppraisalMention[]> {
  const { data } = await api.get<ApiResponse<AppraisalMention[]>>(
    "/student-period-appraisals/mentions",
  );
  return data.data;
}

// reject : 409 APPRAISALS_CONFLICT et rien d'écrit si une ligne a changé sur le serveur ; skip_conflicts : ces lignes sont laissées telles quelles.
export type AppraisalsConflictStrategy = "reject" | "skip_conflicts";

export interface StudentPeriodAppraisalBulkPayload
  extends StudentPeriodAppraisalGridFilters {
  appraisals: {
    enrollmentId: string;
    application: AppraisalMentionValue | null;
    conduct: AppraisalMentionValue | null;
    comments: string | null;
    // undefined : clé omise, pas de contrôle ; null : « aucune appréciation n'existait ».
    expectedUpdatedAt?: string | null;
  }[];
  conflictStrategy?: AppraisalsConflictStrategy;
}

export async function bulkSave(
  api: AxiosInstance,
  payload: StudentPeriodAppraisalBulkPayload,
  options?: WriteRequestOptions,
): Promise<StudentPeriodAppraisalBulkResult> {
  const { data } = await api.post<ApiResponse<StudentPeriodAppraisalBulkResult>>(
    "/student-period-appraisals/bulk",
    {
      school_class_id: payload.schoolClassId,
      school_year_id: payload.schoolYearId,
      school_period_id: payload.schoolPeriodId,
      conflict_strategy: payload.conflictStrategy,
      appraisals: payload.appraisals.map((row) => ({
        enrollment_id: row.enrollmentId,
        application: row.application,
        conduct: row.conduct,
        comments: row.comments,
        expected_updated_at: row.expectedUpdatedAt,
      })),
    },
    toRequestConfig(options),
  );
  return data.data;
}
