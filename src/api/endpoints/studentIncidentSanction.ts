import { StudentIncidentSanction } from "@/utils/types/StudentIncidentSanction";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";
import PaginatedApiResponse from "../responses/PaginatedApiResponse";

interface StudentIncidentSanctionFilters {
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  sanctionTypeId?: string | null;
  incidentTypeId?: string | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: StudentIncidentSanctionFilters,
  page: number,
  perPage: number | "all",
): Promise<PaginatedApiResponse<StudentIncidentSanction>> {
  const { data } = await api.get<
    PaginatedApiResponse<StudentIncidentSanction>
  >("/student-incident-sanctions", { params: { ...filters, page, perPage } });
  return data;
}

export async function show(
  api: AxiosInstance,
  id: string,
): Promise<StudentIncidentSanction> {
  const { data } = await api.get<ApiResponse<StudentIncidentSanction>>(
    `/student-incident-sanctions/${id}`,
  );
  return data.data;
}
