import { Guardian } from "@/utils/types/Guardian";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface GuardianFilters {
  schoolYearId?: string | null;
  searchTerm?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: GuardianFilters,
): Promise<Guardian[]> {
  const { data } = await api.get<ApiResponse<Guardian[]>>("/guardians", {
    params: filters,
  });
  return data.data;
}
