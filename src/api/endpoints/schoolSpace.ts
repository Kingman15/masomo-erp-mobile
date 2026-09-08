import { SchoolSpace } from "@/utils/types/SchoolSpace";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface SchoolSpaceFilters {
  schoolBuildingId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: SchoolSpaceFilters = {},
): Promise<SchoolSpace[]> {
  const { data } = await api.get<ApiResponse<SchoolSpace[]>>(
    "/school-spaces",
    { params: filters },
  );
  return data.data;
}
