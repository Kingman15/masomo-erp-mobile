import { PortalAnnouncementDTO } from "@/utils/types/objects/PortalAnnouncementDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

// Communiqués adressés au personnel connecté (destinataires « Enseignant » / « Personnel »), même format que le portail.

export async function index(
  api: AxiosInstance,
  schoolYearId: string,
): Promise<PortalAnnouncementDTO[]> {
  const { data } = await api.get<ApiResponse<PortalAnnouncementDTO[]>>(
    "/staff/announcements",
    { params: { schoolYearId } },
  );
  return data.data;
}

export async function show(
  api: AxiosInstance,
  announcementId: string,
  schoolYearId: string,
): Promise<PortalAnnouncementDTO> {
  const { data } = await api.get<ApiResponse<PortalAnnouncementDTO>>(
    `/staff/announcements/${announcementId}`,
    { params: { schoolYearId } },
  );
  return data.data;
}

export async function markAsRead(
  api: AxiosInstance,
  announcementId: string,
  schoolYearId: string,
): Promise<void> {
  await api.post(`/staff/announcements/${announcementId}/read`, {
    schoolYearId,
  });
}
