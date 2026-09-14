import {
  FeePaymentDerogationStatus,
  PortalFeePaymentDerogationDTO,
} from "@/utils/types/objects/PortalFeePaymentDerogationDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface PortalFeePaymentDerogationFilters {
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  status?: FeePaymentDerogationStatus | null;
  inProgress?: boolean | null;
}

export async function portalIndex(
  api: AxiosInstance,
  studentId: string,
  filters: PortalFeePaymentDerogationFilters,
): Promise<PortalFeePaymentDerogationDTO[]> {
  const { data } = await api.get<ApiResponse<PortalFeePaymentDerogationDTO[]>>(
    "/portal/fee-payment-derogations",
    {
      params: {
        studentId,
        schoolYearId: filters.schoolYearId ?? undefined,
        schoolClassId: filters.schoolClassId ?? undefined,
        status: filters.status ?? undefined,
        inProgress: filters.inProgress ?? undefined,
      },
    },
  );
  return data.data;
}

export async function portalShow(
  api: AxiosInstance,
  studentId: string,
  feePaymentDerogationId: string,
): Promise<PortalFeePaymentDerogationDTO> {
  const { data } = await api.get<ApiResponse<PortalFeePaymentDerogationDTO>>(
    `/portal/fee-payment-derogations/${feePaymentDerogationId}`,
    { params: { studentId } },
  );
  return data.data;
}
