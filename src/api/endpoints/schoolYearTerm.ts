import { SchoolYearTerm } from "@/utils/types/SchoolYearTerm";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface SchoolYearTermFilters {
  schoolYearId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: SchoolYearTermFilters,
): Promise<SchoolYearTerm[]> {
  const { data } = await api.get<
    ApiResponse<SchoolYearTerm[]>
  >("/school-year-terms", { params: filters });

  return data.data;
}
