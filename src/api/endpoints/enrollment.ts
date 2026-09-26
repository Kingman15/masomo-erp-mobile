import { Enrollment } from "@/utils/types/Enrollment";
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
