import type {
  DeliberationSession,
  EnrollmentDecisionBulkPayload,
  EnrollmentDecisionBulkResult,
  EnrollmentDecisionGrid,
  EnrollmentDecisionGridMeta,
  EnrollmentDecisionGridRow,
  EnrollmentDecisionPoint,
  EnrollmentDecisionType,
} from "@/utils/types/EnrollmentDecision";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export interface EnrollmentDecisionGridFilters {
  schoolClassId: string;
  schoolYearId: string;
  session: DeliberationSession;
}

// Grille de délibération d'une classe ; un enseignant n'y accède que pour sa classe de titulaire (EnrollmentDecisionPolicy).
export async function grid(
  api: AxiosInstance,
  filters: EnrollmentDecisionGridFilters,
): Promise<EnrollmentDecisionGrid> {
  const { data } = await api.get<{
    data: EnrollmentDecisionGridRow[];
    meta: EnrollmentDecisionGridMeta;
  }>("/enrollment-decisions", { params: filters });

  return { rows: data.data, meta: data.meta };
}

export async function types(
  api: AxiosInstance,
): Promise<EnrollmentDecisionType[]> {
  const { data } = await api.get<ApiResponse<EnrollmentDecisionType[]>>(
    "/enrollment-decisions/types",
  );
  return data.data;
}

export async function bulkSave(
  api: AxiosInstance,
  payload: EnrollmentDecisionBulkPayload,
): Promise<EnrollmentDecisionBulkResult> {
  const { data } = await api.post<ApiResponse<EnrollmentDecisionBulkResult>>(
    "/enrollment-decisions/bulk",
    payload,
  );
  return data.data;
}

// Données annexes de la délibération ---

// Note de passage de l'école (en %), chaîne numérique ou null si non configurée
export async function passMark(api: AxiosInstance): Promise<string | null> {
  const { data } = await api.get<ApiResponse<{ passMark: string | null }>>(
    "/settings/pass-mark",
  );
  return data.data.passMark;
}

// Points d'un élève (cours x période) pour une session : ceux de sa décision, ou ceux qu'elle reprendra à sa création.
export async function points(
  api: AxiosInstance,
  filters: EnrollmentDecisionGridFilters & { enrollmentId: string },
): Promise<EnrollmentDecisionPoint[]> {
  const { data } = await api.get<ApiResponse<EnrollmentDecisionPoint[]>>(
    "/enrollment-decisions/points",
    { params: filters },
  );
  return data.data;
}
