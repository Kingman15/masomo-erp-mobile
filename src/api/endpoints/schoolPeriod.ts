import { SchoolPeriod } from "@/utils/types/SchoolPeriod";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function index(api: AxiosInstance): Promise<SchoolPeriod[]> {
  const { data } = await api.get<ApiResponse<SchoolPeriod[]>>(
    "/school-periods",
  );
  return data.data;
}
