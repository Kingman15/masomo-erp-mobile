import type { FeePaymentDerogationStatus } from "@/utils/types/objects/PortalFeePaymentDerogationDTO";

export const portalFeePaymentDerogationKeys = {
  all: ["portal-fee-payment-derogations"] as const,

  list: (
    studentId: string | null | undefined,
    filters: {
      schoolClassId?: string | null;
      schoolYearId?: string | null;
      status?: FeePaymentDerogationStatus | null;
      inProgress?: boolean | null;
    },
  ) => [...portalFeePaymentDerogationKeys.all, studentId, "list", filters] as const,

  detail: (studentId: string | null | undefined, feePaymentDerogationId?: string) =>
    [...portalFeePaymentDerogationKeys.all, studentId, "detail", feePaymentDerogationId] as const,
};
