import { ServiceDesk } from "@/utils/types/ServiceDesk";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function mine(api: AxiosInstance): Promise<ServiceDesk[]> {
  const { data } = await api.get<ApiResponse<ServiceDesk[]>>(
    "/service-desks/mine",
  );
  return data.data;
}
