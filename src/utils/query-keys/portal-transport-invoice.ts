import type { PortalTransportInvoiceStatus } from "@/utils/types/objects/PortalTransportInvoiceDTO";

export const portalTransportInvoiceKeys = {
  all: ["portalTransportInvoices"] as const,

  list: (
    studentId: string | null | undefined,
    filters: { schoolYearId?: string | null; status?: PortalTransportInvoiceStatus | null },
  ) => [...portalTransportInvoiceKeys.all, studentId ?? null, "list", filters] as const,

  detail: (studentId: string | null | undefined, invoiceId?: string | null) =>
    [...portalTransportInvoiceKeys.all, studentId ?? null, "detail", invoiceId ?? null] as const,
};
