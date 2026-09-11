import { Option } from "@/utils/types/Option";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface OptionFilters {
  sectionId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: OptionFilters,
): Promise<Option[]> {
  const { data } = await api.get<ApiResponse<Option[]>>("/options", {
    params: filters,
  });
  return data.data;
}
