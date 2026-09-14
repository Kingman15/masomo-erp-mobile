import {
  TransportSubscription,
  TransportSubscriptionStatus,
} from "@/utils/types/TransportSubscription";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function current(
  api: AxiosInstance,
  studentId: string,
): Promise<TransportSubscription | null> {
  const { data } = await api.get<ApiResponse<TransportSubscription | null>>(
    "/portal/transport/subscriptions/current",
    { params: { studentId } },
  );
  return data.data ?? null;
}

interface PortalTransportSubscriptionListFilters {
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  shiftId?: string | null;
  status?: TransportSubscriptionStatus | null;
}

export async function list(
  api: AxiosInstance,
  studentId: string,
  filters: PortalTransportSubscriptionListFilters,
): Promise<TransportSubscription[]> {
  const { data } = await api.get<ApiResponse<TransportSubscription[]>>(
    "/portal/transport/subscriptions",
    {
      params: {
        studentId,
        schoolYearId: filters.schoolYearId ?? undefined,
        schoolClassId: filters.schoolClassId ?? undefined,
        shiftId: filters.shiftId ?? undefined,
        status: filters.status ?? undefined,
      },
    },
  );
  return data.data;
}

export async function show(
  api: AxiosInstance,
  studentId: string,
  subscriptionId: string,
): Promise<TransportSubscription> {
  const { data } = await api.get<ApiResponse<TransportSubscription>>(
    `/portal/transport/subscriptions/${subscriptionId}`,
    { params: { studentId } },
  );
  return data.data;
}
