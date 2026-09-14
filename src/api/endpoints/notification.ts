import { NotificationDTO } from "@/utils/types/objects/NotificationDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";
import PaginatedApiResponse from "../responses/PaginatedApiResponse";

interface NotificationFilters {
  studentId?: string | null;
  type?: string | null;
  unreadOnly?: boolean | null;
}

export async function index(
  api: AxiosInstance,
  filters: NotificationFilters,
  page: number,
  perPage: number,
): Promise<PaginatedApiResponse<NotificationDTO>> {
  const { data } = await api.get<PaginatedApiResponse<NotificationDTO>>(
    "/notifications",
    {
      params: {
        studentId: filters.studentId ?? undefined,
        type: filters.type ?? undefined,
        unreadOnly: filters.unreadOnly ?? undefined,
        page,
        perPage,
      },
    },
  );
  return data;
}

export async function unreadCount(
  api: AxiosInstance,
  studentId?: string | null,
): Promise<{ count: number }> {
  const { data } = await api.get<{ count: number }>(
    "/notifications/unread-count",
    { params: { studentId: studentId ?? undefined } },
  );
  return data;
}

export async function markAsRead(
  api: AxiosInstance,
  id: string,
): Promise<NotificationDTO> {
  const { data } = await api.get<ApiResponse<NotificationDTO>>(
    `/notifications/${id}`,
  );
  return data.data;
}

export interface MarkAllNotificationsReadPayload {
  studentId?: string | null;
}

export async function markAllAsRead(
  api: AxiosInstance,
  payload: MarkAllNotificationsReadPayload,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/notifications/mark-all-read",
    payload,
  );
  return data;
}
