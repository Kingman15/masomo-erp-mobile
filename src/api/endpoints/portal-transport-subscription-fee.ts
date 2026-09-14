import type {
  TransportSubscriptionFeePaymentStatusFilter,
  TransportSubscriptionFeesSummaryDTO,
} from "@/utils/types/objects/TransportSubscriptionFeesSummaryDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface PortalTransportSubscriptionFeesFilters {
  schoolClassId?: string | null;
  schoolYearId?: string | null;
  paymentStatus?: TransportSubscriptionFeePaymentStatusFilter | null;
}

export async function show(
  api: AxiosInstance,
  studentId: string,
  filters: PortalTransportSubscriptionFeesFilters,
): Promise<TransportSubscriptionFeesSummaryDTO> {
  const { data } = await api.get<ApiResponse<TransportSubscriptionFeesSummaryDTO>>(
    "/portal/transport/subscription-fees",
    {
      params: {
        studentId,
        schoolClassId: filters.schoolClassId ?? undefined,
        schoolYearId: filters.schoolYearId ?? undefined,
        paymentStatus: filters.paymentStatus ?? undefined,
      },
    },
  );
  return data.data;
}
