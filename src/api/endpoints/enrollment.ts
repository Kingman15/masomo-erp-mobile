import { Enrollment } from "@/utils/types/Enrollment";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface CurrentEnrollmentsFilters {
  schoolYearId?: string | null;
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
