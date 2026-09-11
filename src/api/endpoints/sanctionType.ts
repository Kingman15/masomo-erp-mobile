import { SanctionType } from "@/utils/types/SanctionType";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function index(api: AxiosInstance): Promise<SanctionType[]> {
  const { data } = await api.get<ApiResponse<SanctionType[]>>(
    "/sanction-types",
  );
  return data.data;
}
