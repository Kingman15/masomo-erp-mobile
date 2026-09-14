import { SchoolYearSchoolYearSubdivision } from "@/utils/types/SchoolYearSchoolYearSubdivision";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface SchoolYearSchoolYearSubdivisionFilters {
  schoolYearId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: SchoolYearSchoolYearSubdivisionFilters,
): Promise<SchoolYearSchoolYearSubdivision[]> {
  const { data } = await api.get<
    ApiResponse<SchoolYearSchoolYearSubdivision[]>
  >("/school-year-school-year-subdivisions", { params: filters });

  return data.data;
}
