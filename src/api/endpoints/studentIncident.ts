import { IncidentStudentRole } from "@/utils/types/IncidentStudent";
import { StudentIncident, StudentIncidentStatus } from "@/utils/types/StudentIncident";
import type { StudentIncidentSanctionStatus } from "@/utils/types/StudentIncidentSanction";
import { PortalIncidentDTO } from "@/utils/types/objects/PortalIncidentDTO";
import { PortalIncidentSanctionDTO } from "@/utils/types/objects/PortalIncidentSanctionDTO";
import { AxiosInstance } from "axios";
import { toRequestConfig, type WriteRequestOptions } from "../idempotency";
import ApiResponse from "../responses/ApiResponse";
import PaginatedApiResponse from "../responses/PaginatedApiResponse";

interface StudentIncidentFilters {
  schoolYearId?: string | null;
  incidentTypeId?: string | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  searchTerm?: string | null;
  studentId?: string | null;
  schoolClassId?: string | null;
}

interface PortalIncidentFilters {
  schoolYearId?: string;
  status?: StudentIncidentStatus;
  startDate?: string;
  endDate?: string;
  schoolClassId?: string;
}

export interface PortalIncidentDetailDTO {
  incident: PortalIncidentDTO;
  sanctions: PortalIncidentSanctionDTO[];
}

export async function portalIndex(
  api: AxiosInstance,
  studentId: string,
  filters: PortalIncidentFilters,
): Promise<PortalIncidentDTO[]> {
  const { data } = await api.get<ApiResponse<PortalIncidentDTO[]>>(
    "/portal/student-incidents",
    { params: { studentId, ...filters } },
  );
  return data.data;
}

export async function portalShow(
  api: AxiosInstance,
  studentId: string,
  incidentId: string,
): Promise<PortalIncidentDetailDTO> {
  const { data } = await api.get<ApiResponse<PortalIncidentDetailDTO>>(
    `/portal/student-incidents/${incidentId}`,
    { params: { studentId } },
  );
  return data.data;
}

export async function index(
  api: AxiosInstance,
  filters: StudentIncidentFilters,
  page: number,
  perPage: number | "all",
): Promise<PaginatedApiResponse<StudentIncident>> {
  const { data } = await api.get<PaginatedApiResponse<StudentIncident>>(
    "/student-incidents",
    { params: { ...filters, page, perPage } },
  );
  return data;
}

export async function show(
  api: AxiosInstance,
  id: string,
): Promise<StudentIncident> {
  const { data } = await api.get<ApiResponse<StudentIncident>>(
    `/student-incidents/${id}`,
  );
  return data.data;
}

export interface TeacherReportStudentIncidentStudentPayload {
  studentId: string;
  role: IncidentStudentRole;
  notes?: string | null;
}

export interface TeacherReportStudentIncidentPayload {
  schoolYearId: string;
  incidentTypeId: string | null;
  mainStudentId: string | null;
  occurredAt: string;
  reportedAt: string | null;
  description: string | null;
  location: string | null;
  severityLevel: number | null;
  students: TeacherReportStudentIncidentStudentPayload[];
}

function toRequestBody(payload: TeacherReportStudentIncidentPayload) {
  return {
    school_year_id: payload.schoolYearId,
    incident_type_id: payload.incidentTypeId,
    main_student_id: payload.mainStudentId,
    occurred_at: payload.occurredAt,
    reported_at: payload.reportedAt,
    description: payload.description,
    location: payload.location,
    severity_level: payload.severityLevel,
    students: payload.students.map((student) => ({
      student_id: student.studentId,
      role: student.role,
      notes: student.notes ?? undefined,
    })),
  };
}

export async function teacherReport(
  api: AxiosInstance,
  payload: TeacherReportStudentIncidentPayload,
  options?: WriteRequestOptions,
): Promise<StudentIncident> {
  const { data } = await api.post<ApiResponse<StudentIncident>>(
    "/student-incidents/teacher-report",
    toRequestBody(payload),
    toRequestConfig(options),
  );
  return data.data;
}

// --- Saisie complète (direction, directeur de discipline) : POST/PUT /student-incidents, en ligne ---

export interface IncidentStudentPayload {
  id?: string | null; // ligne existante (mise à jour)
  studentId: string;
  role: IncidentStudentRole;
  notes?: string | null;
}

export interface IncidentSanctionPayload {
  id?: string | null;
  studentId: string;
  sanctionTypeId: string | null;
  regulationArticleId: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: StudentIncidentSanctionStatus;
  justification: string | null;
  notes: string | null;
  decidedBy: string | null;
  decidedAt: string;
  isAppealed: boolean;
  appealedAt: string | null;
  appealNotes: string | null;
  parentsNotified: boolean;
  parentsNotifiedAt: string | null;
  parentsNotifiedBy: string | null;
  delete?: boolean;
}

// Le serveur réécrit tous les champs de l'incident : un champ omis serait effacé.
// Élèves et sanctions, eux, sont mis à jour ligne par ligne (une ligne absente reste intacte).
export interface StudentIncidentPayload {
  schoolYearId: string;
  incidentTypeId: string | null;
  mainStudentId: string | null;
  occurredAt: string | null;
  reportedAt: string | null;
  description: string | null;
  location: string | null;
  severityLevel: number | null;
  status: StudentIncidentStatus;
  reportedBy: string | null;
  handledBy: string | null;
  temporaryMeasureApplied: boolean;
  temporaryMeasureDescription: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  measuresTaken: string | null;
  psychologicalSupportRequired: boolean;
  psychologicalSupportNotes: string | null;
  parentsNotified: boolean;
  parentsNotifiedAt: string | null;
  parentsNotifiedBy: string | null;
  internalNotes: string | null;
  students: IncidentStudentPayload[];
  sanctions: IncidentSanctionPayload[];
}

// Point de départ d'une mise à jour : l'incident tel que chargé, élèves inclus, sans sanction.
export function incidentToPayload(incident: StudentIncident): StudentIncidentPayload {
  return {
    schoolYearId: incident.schoolYearId ?? "",
    incidentTypeId: incident.incidentTypeId,
    mainStudentId: incident.mainStudentId,
    occurredAt: incident.occurredAt,
    reportedAt: incident.reportedAt,
    description: incident.description,
    location: incident.location,
    severityLevel: incident.severityLevel,
    status: incident.status ?? "open",
    reportedBy: incident.reportedBy,
    handledBy: incident.handledBy,
    temporaryMeasureApplied: incident.temporaryMeasureApplied,
    temporaryMeasureDescription: incident.temporaryMeasureDescription,
    resolvedAt: incident.resolvedAt,
    resolvedBy: incident.resolvedBy,
    measuresTaken: incident.measuresTaken,
    psychologicalSupportRequired: incident.psychologicalSupportRequired,
    psychologicalSupportNotes: incident.psychologicalSupportNotes,
    parentsNotified: incident.parentsNotified,
    parentsNotifiedAt: incident.parentsNotifiedAt,
    parentsNotifiedBy: incident.parentsNotifiedBy,
    internalNotes: incident.internalNotes,
    students: (incident.incidentStudents ?? [])
      .filter((item) => item.studentId)
      .map((item) => ({
        id: item.id,
        studentId: item.studentId as string,
        role: item.role ?? "involved",
        notes: item.notes,
      })),
    sanctions: [],
  };
}

function toFullRequestBody(payload: StudentIncidentPayload) {
  return {
    school_year_id: payload.schoolYearId,
    incident_type_id: payload.incidentTypeId,
    main_student_id: payload.mainStudentId,
    occurred_at: payload.occurredAt,
    reported_at: payload.reportedAt,
    description: payload.description,
    location: payload.location,
    severity_level: payload.severityLevel,
    status: payload.status,
    reported_by: payload.reportedBy,
    handled_by: payload.handledBy,
    temporary_measure_applied: payload.temporaryMeasureApplied,
    temporary_measure_description: payload.temporaryMeasureDescription,
    resolved_at: payload.resolvedAt,
    resolved_by: payload.resolvedBy,
    measures_taken: payload.measuresTaken,
    psychological_support_required: payload.psychologicalSupportRequired,
    psychological_support_notes: payload.psychologicalSupportNotes,
    parents_notified: payload.parentsNotified,
    parents_notified_at: payload.parentsNotifiedAt,
    parents_notified_by: payload.parentsNotifiedBy,
    internal_notes: payload.internalNotes,
    students: payload.students.map((student) => ({
      id: student.id ?? undefined,
      student_id: student.studentId,
      role: student.role,
      notes: student.notes ?? null,
    })),
    sanctions: payload.sanctions.map((sanction) => ({
      id: sanction.id ?? undefined,
      student_id: sanction.studentId,
      sanction_type_id: sanction.sanctionTypeId,
      regulation_article_id: sanction.regulationArticleId,
      starts_at: sanction.startsAt,
      ends_at: sanction.endsAt,
      status: sanction.status,
      justification: sanction.justification,
      notes: sanction.notes,
      decided_by: sanction.decidedBy,
      decided_at: sanction.decidedAt,
      is_appealed: sanction.isAppealed,
      appealed_at: sanction.appealedAt,
      appeal_notes: sanction.appealNotes,
      parents_notified: sanction.parentsNotified,
      parents_notified_at: sanction.parentsNotifiedAt,
      parents_notified_by: sanction.parentsNotifiedBy,
      _delete: sanction.delete || undefined,
    })),
  };
}

export async function store(
  api: AxiosInstance,
  payload: StudentIncidentPayload,
): Promise<StudentIncident> {
  const { data } = await api.post<ApiResponse<StudentIncident>>(
    "/student-incidents",
    toFullRequestBody(payload),
  );
  return data.data;
}

export async function update(
  api: AxiosInstance,
  id: string,
  payload: StudentIncidentPayload,
): Promise<StudentIncident> {
  const { data } = await api.put<ApiResponse<StudentIncident>>(
    `/student-incidents/${id}`,
    toFullRequestBody(payload),
  );
  return data.data;
}
