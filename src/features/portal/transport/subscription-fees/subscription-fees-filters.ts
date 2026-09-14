import type { TransportSubscriptionFeePaymentStatusFilter } from "@/utils/types/objects/TransportSubscriptionFeesSummaryDTO";

export type SubscriptionFeesFiltersForm = {
  paymentStatus: TransportSubscriptionFeePaymentStatusFilter | null;
};

export const emptySubscriptionFeesFilters: SubscriptionFeesFiltersForm = {
  paymentStatus: null,
};
