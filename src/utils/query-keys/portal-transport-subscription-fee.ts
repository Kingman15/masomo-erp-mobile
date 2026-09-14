import type { TransportSubscriptionFeePaymentStatusFilter } from "@/utils/types/objects/TransportSubscriptionFeesSummaryDTO";

export const portalTransportSubscriptionFeeKeys = {
  all: ["portalTransportSubscriptionFees"] as const,

  list: (
    studentId: string | null | undefined,
    filters: {
      schoolClassId?: string | null;
      schoolYearId?: string | null;
      paymentStatus?: TransportSubscriptionFeePaymentStatusFilter | null;
    },
  ) => [...portalTransportSubscriptionFeeKeys.all, studentId ?? null, "list", filters] as const,
};
