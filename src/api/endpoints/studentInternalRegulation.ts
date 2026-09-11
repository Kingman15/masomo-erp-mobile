import { StudentInternalRegulation } from "@/utils/types/StudentInternalRegulation";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface StudentInternalRegulationFilters {
  schoolYearId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: StudentInternalRegulationFilters,
): Promise<StudentInternalRegulation[]> {
  const { data } = await api.get<ApiResponse<StudentInternalRegulation[]>>(
    "/student-internal-regulations",
    { params: filters },
  );
  return data.data;
}
