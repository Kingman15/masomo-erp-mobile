import { Student } from "@/utils/types/Student";
import { AxiosInstance } from "axios";
import PaginatedApiResponse from "../responses/PaginatedApiResponse";

interface StudentFilters {
  schoolYearId?: string | null;
  searchTerm?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: StudentFilters,
  page: number,
  perPage: number | "all",
): Promise<PaginatedApiResponse<Student>> {
  const { data } = await api.get<PaginatedApiResponse<Student>>("/students", {
    params: { ...filters, page, perPage },
  });
  return data;
}
