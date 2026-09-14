import { FeeScheduleDTO, FeeScheduleSortBy, FeeScheduleStatus } from "@/utils/types/objects/FeeScheduleDTO";
import { FeeScheduleSummaryDTO } from "@/utils/types/objects/FeeScheduleSummaryDTO";
import { PortalFeePaymentDTO } from "@/utils/types/objects/PortalFeePaymentDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface FeeScheduleFilters {
  studentId?: string | null;
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  status?: FeeScheduleStatus[] | null;
  sortBy?: FeeScheduleSortBy | null;
}

export async function feeSchedule(
  api: AxiosInstance,
  filters: FeeScheduleFilters,
): Promise<FeeScheduleDTO[]> {
  const { data } = await api.get<ApiResponse<FeeScheduleDTO[]>>(
    "/fee-payments/schedule",
    {
      params: {
        studentId: filters.studentId ?? undefined,
        schoolYearId: filters.schoolYearId ?? undefined,
        schoolClassId: filters.schoolClassId ?? undefined,
        status: filters.status?.length ? filters.status : undefined,
        sortBy: filters.sortBy ?? undefined,
      },
    },
  );
  return data.data;
}

interface PortalFeePaymentFilters {
  schoolYearId?: string | null;
  schoolClassId?: string | null;
}

export async function portalIndex(
  api: AxiosInstance,
  studentId: string,
  filters: PortalFeePaymentFilters,
): Promise<PortalFeePaymentDTO[]> {
  const { data } = await api.get<ApiResponse<PortalFeePaymentDTO[]>>(
    "/portal/fee-payments",
    {
      params: {
        studentId,
        schoolYearId: filters.schoolYearId ?? undefined,
        schoolClassId: filters.schoolClassId ?? undefined,
      },
    },
  );
  return data.data;
}

export async function portalShow(
  api: AxiosInstance,
  studentId: string,
  feePaymentId: string,
): Promise<PortalFeePaymentDTO> {
  const { data } = await api.get<ApiResponse<PortalFeePaymentDTO>>(
    `/portal/fee-payments/${feePaymentId}`,
    { params: { studentId } },
  );
  return data.data;
}

interface FeeScheduleSummaryFilters {
  studentId?: string | null;
  schoolYearId?: string | null;
  schoolClassId?: string | null;
}

export async function feeScheduleSummary(
  api: AxiosInstance,
  filters: FeeScheduleSummaryFilters,
): Promise<FeeScheduleSummaryDTO> {
  const { data } = await api.get<ApiResponse<FeeScheduleSummaryDTO>>(
    "/fee-payments/schedule-summary",
    {
      params: {
        studentId: filters.studentId ?? undefined,
        schoolYearId: filters.schoolYearId ?? undefined,
        schoolClassId: filters.schoolClassId ?? undefined,
      },
    },
  );
  return data.data;
}
