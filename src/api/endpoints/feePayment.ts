import { FeeScheduleDTO, FeeScheduleSortBy, FeeScheduleStatus } from "@/utils/types/objects/FeeScheduleDTO";
import { FeeScheduleSummaryDTO } from "@/utils/types/objects/FeeScheduleSummaryDTO";
import { PortalFeePaymentDTO } from "@/utils/types/objects/PortalFeePaymentDTO";
import type { FeePayment, FeePaymentDerogation } from "@/utils/types/FeePayment";
import type {
  FeeCollectionAvailableFeeDTO,
  FeeCollectionListDTO,
} from "@/utils/types/objects/FeeCollectionListDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";
import PaginatedApiResponse from "../responses/PaginatedApiResponse";

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

// --- Consultation du personnel (permissions schoolFees.*) ---

// Lignes de paiement d'une inscription (une par tranche), versements compris.
export async function index(
  api: AxiosInstance,
  filters: { enrollmentId?: string | null; schoolYearId?: string | null },
): Promise<FeePayment[]> {
  const { data } = await api.get<PaginatedApiResponse<FeePayment>>("/fee-payments", {
    params: { ...filters, page: 1, perPage: "all" },
  });
  return data.data;
}

export async function show(api: AxiosInstance, id: string): Promise<FeePayment> {
  const { data } = await api.get<ApiResponse<FeePayment>>(`/fee-payments/${id}`);
  return data.data;
}

// Reçu PDF (même document que le web), à partager depuis l'appareil.
export async function receiptPdf(api: AxiosInstance, id: string): Promise<ArrayBuffer> {
  const { data } = await api.get<ArrayBuffer>(`/fee-payments/${id}/pdf/download`, {
    responseType: "arraybuffer",
  });
  return data;
}

export async function derogations(
  api: AxiosInstance,
  filters: { enrollmentId: string; schoolYearId: string },
): Promise<FeePaymentDerogation[]> {
  const { data } = await api.get<PaginatedApiResponse<FeePaymentDerogation>>(
    "/fee-payment-derogations",
    { params: filters },
  );
  return data.data;
}

export async function collectionAvailableFees(
  api: AxiosInstance,
  filters: { schoolYearId: string; schoolClassId: string },
): Promise<FeeCollectionAvailableFeeDTO[]> {
  const { data } = await api.get<ApiResponse<FeeCollectionAvailableFeeDTO[]>>(
    "/fees/collection-list/available-fees",
    { params: filters },
  );
  return data.data;
}

export async function collectionList(
  api: AxiosInstance,
  filters: { schoolYearId: string; schoolClassId: string; feeIds: string[] },
): Promise<FeeCollectionListDTO> {
  const { data } = await api.get<ApiResponse<FeeCollectionListDTO>>(
    "/fees/collection-list",
    { params: { ...filters, sortBy: "status" } },
  );
  return data.data;
}
