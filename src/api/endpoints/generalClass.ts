import { GeneralClass } from "@/utils/types/GeneralClass";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface GeneralClassFilters {
  sectionId?: string | null;
  optionId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: GeneralClassFilters,
): Promise<GeneralClass[]> {
  const { data } = await api.get<ApiResponse<GeneralClass[]>>(
    "/general-classes",
    { params: filters },
  );
  return data.data;
}
