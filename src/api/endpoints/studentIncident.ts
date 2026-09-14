import { IncidentStudentRole } from "@/utils/types/IncidentStudent";
import { StudentIncident, StudentIncidentStatus } from "@/utils/types/StudentIncident";
import { PortalIncidentDTO } from "@/utils/types/objects/PortalIncidentDTO";
import { PortalIncidentSanctionDTO } from "@/utils/types/objects/PortalIncidentSanctionDTO";
import { AxiosInstance } from "axios";
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
): Promise<StudentIncident> {
  const { data } = await api.post<ApiResponse<StudentIncident>>(
    "/student-incidents/teacher-report",
    toRequestBody(payload),
  );
  return data.data;
}
