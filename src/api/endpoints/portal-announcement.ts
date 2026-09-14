import { PortalAnnouncementDTO } from "@/utils/types/objects/PortalAnnouncementDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface PortalAnnouncementFilters {
  schoolYearId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: PortalAnnouncementFilters,
): Promise<PortalAnnouncementDTO[]> {
  const { data } = await api.get<ApiResponse<PortalAnnouncementDTO[]>>(
    "/portal/announcements",
    { params: { schoolYearId: filters.schoolYearId ?? undefined } },
  );
  return data.data;
}

export async function show(
  api: AxiosInstance,
  announcementId: string,
  schoolYearId: string,
): Promise<PortalAnnouncementDTO> {
  const { data } = await api.get<ApiResponse<PortalAnnouncementDTO>>(
    `/portal/announcements/${announcementId}`,
    { params: { schoolYearId } },
  );
  return data.data;
}

export interface MarkAnnouncementReadPayload {
  schoolYearId: string;
  studentId?: string | null;
}

export async function markAsRead(
  api: AxiosInstance,
  announcementId: string,
  payload: MarkAnnouncementReadPayload,
): Promise<void> {
  await api.post(`/portal/announcements/${announcementId}/read`, payload);
}
