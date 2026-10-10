import { Enrollment } from "@/utils/types/Enrollment";
import { StudentReportCardDTO } from "@/utils/types/objects/StudentReportCardDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";
import PaginatedApiResponse from "../responses/PaginatedApiResponse";

interface CurrentEnrollmentsFilters {
  schoolYearId?: string | null;
}

interface EnrollmentFilters {
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
  withoutAttendanceSessionId?: string | null;
  searchTerm?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: EnrollmentFilters,
  page: number,
  perPage: number | "all",
): Promise<PaginatedApiResponse<Enrollment>> {
  const { data } = await api.get<PaginatedApiResponse<Enrollment>>(
    "/enrollments",
    { params: { ...filters, page, perPage } },
  );
  return data;
}

// Bulletin (vue de consultation) ; un enseignant n'y accède que pour la classe dont il est titulaire (gate manageReportCards).
export async function reportCard(
  api: AxiosInstance,
  enrollmentId: string,
): Promise<StudentReportCardDTO> {
  const { data } = await api.get<ApiResponse<StudentReportCardDTO>>(
    `/enrollments/${enrollmentId}/report-card`,
  );
  return data.data;
}

export async function currentEnrollments(
  api: AxiosInstance,
  filters: CurrentEnrollmentsFilters = {},
): Promise<Enrollment[]> {
  const { data } = await api.get<ApiResponse<Enrollment[]>>(
    "/enrollments/current-enrollments",
    { params: filters },
  );
  return data.data;
}

// Fiche d'inscription : élève, classe, tuteur principal (consultation du personnel).
export async function show(
  api: AxiosInstance,
  id: string,
): Promise<Enrollment> {
  const { data } = await api.get<ApiResponse<Enrollment>>(`/enrollments/${id}`);
  return data.data;
}
