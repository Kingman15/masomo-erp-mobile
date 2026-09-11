import { IncidentType } from "@/utils/types/IncidentType";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function index(api: AxiosInstance): Promise<IncidentType[]> {
  const { data } = await api.get<ApiResponse<IncidentType[]>>(
    "/incident-types",
  );
  return data.data;
}
