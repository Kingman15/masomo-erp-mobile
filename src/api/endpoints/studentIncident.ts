import { IncidentStudentRole } from "@/utils/types/IncidentStudent";
import { StudentIncident } from "@/utils/types/StudentIncident";
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
