import { School } from "@/utils/types/School";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function current(api: AxiosInstance): Promise<School | null> {
  const { data } = await api.get<ApiResponse<School | null>>(
    "/schools/current",
  );
  return data.data ?? null;
}
