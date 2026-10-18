import type { FeePaymentDerogationStatus } from "@/utils/types/objects/PortalFeePaymentDerogationDTO";

export type WaiversFiltersForm = {
  status: FeePaymentDerogationStatus | null;
  inProgress: boolean | null;
  includePending: boolean;
};

export const defaultWaiversFilters: WaiversFiltersForm = {
  status: null,
  inProgress: true,
  includePending: true,
};
