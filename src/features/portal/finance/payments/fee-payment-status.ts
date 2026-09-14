import type { FeePaymentStatus } from "@/utils/types/objects/PortalFeePaymentDTO";

export const FEE_PAYMENT_STATUS_LABEL_MAP: Record<FeePaymentStatus, string> = {
  pending: "En attente",
  partial: "Partiel",
  paid: "Payé",
};
