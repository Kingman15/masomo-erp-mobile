import api from "@/api/client";
import { list, show } from "@/api/endpoints/portal-transport-invoice";
import { portalTransportInvoiceKeys } from "@/utils/query-keys/portal-transport-invoice";
import type {
  PortalTransportInvoiceDTO,
  PortalTransportInvoiceStatus,
} from "@/utils/types/objects/PortalTransportInvoiceDTO";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

interface UsePortalTransportInvoicesParams {
  studentId: string | null | undefined;
  filters?: {
    schoolYearId?: string | null;
    status?: PortalTransportInvoiceStatus | null;
  };
  enabled?: boolean;
}

export function usePortalTransportInvoices({
  studentId,
  filters = {},
  enabled = true,
}: UsePortalTransportInvoicesParams) {
  const query = useListQuery<PortalTransportInvoiceDTO>({
    queryKey: portalTransportInvoiceKeys.list(studentId, filters),
    queryFn: () => list(api, studentId!, filters),
    label: "Factures de transport",
    enabled: enabled && Boolean(studentId),
  });

  return {
    portalTransportInvoices: query.data ?? [],
    portalTransportInvoicesError: query.error,
    portalTransportInvoicesIsLoading: query.isLoading,
    portalTransportInvoicesIsFetching: query.isFetching,
    loadPortalTransportInvoices: query.refetch,
  };
}

interface UsePortalTransportInvoiceParams {
  studentId: string | null | undefined;
  invoiceId: string | null | undefined;
}

export function usePortalTransportInvoice({
  studentId,
  invoiceId,
}: UsePortalTransportInvoiceParams) {
  const query = useSingletonQuery<PortalTransportInvoiceDTO>({
    queryKey: portalTransportInvoiceKeys.detail(studentId, invoiceId),
    queryFn: () => show(api, studentId!, invoiceId!),
    label: "Facture de transport",
    enabled: Boolean(studentId && invoiceId),
  });

  return {
    portalTransportInvoice: query.data,
    portalTransportInvoiceIsLoading: query.isLoading,
    portalTransportInvoiceError: query.error,
    loadPortalTransportInvoice: query.refetch,
  };
}
