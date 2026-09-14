import type {
  PortalTransportInvoiceDTO,
  PortalTransportInvoiceStatus,
} from "@/utils/types/objects/PortalTransportInvoiceDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface PortalTransportInvoiceListFilters {
  schoolYearId?: string | null;
  status?: PortalTransportInvoiceStatus | null;
}

export async function list(
  api: AxiosInstance,
  studentId: string,
  filters: PortalTransportInvoiceListFilters,
): Promise<PortalTransportInvoiceDTO[]> {
  const { data } = await api.get<ApiResponse<PortalTransportInvoiceDTO[]>>(
    "/portal/transport/invoices",
    {
      params: {
        studentId,
        schoolYearId: filters.schoolYearId ?? undefined,
        status: filters.status ?? undefined,
      },
    },
  );
  return data.data;
}

export async function show(
  api: AxiosInstance,
  studentId: string,
  invoiceId: string,
): Promise<PortalTransportInvoiceDTO> {
  const { data } = await api.get<ApiResponse<PortalTransportInvoiceDTO>>(
    `/portal/transport/invoices/${invoiceId}`,
    { params: { studentId } },
  );
  return data.data;
}
