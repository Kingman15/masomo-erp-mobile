import type { PortalTransportScheduleDTO } from "@/utils/types/objects/PortalTransportScheduleDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function index(
  api: AxiosInstance,
  studentId: string,
): Promise<PortalTransportScheduleDTO[]> {
  const { data } = await api.get<ApiResponse<PortalTransportScheduleDTO[]>>(
    "/portal/transport/schedules",
    { params: { studentId } },
  );
  return data.data;
}
