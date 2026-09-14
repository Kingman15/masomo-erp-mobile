import type { FeePaymentDerogationStatus } from "@/utils/types/objects/PortalFeePaymentDerogationDTO";

export type WaiversFiltersForm = {
  status: FeePaymentDerogationStatus | null;
  inProgress: boolean | null;
};

export const defaultWaiversFilters: WaiversFiltersForm = {
  status: null,
  inProgress: true,
};
