import type { FeePaymentDerogationStatus } from "@/utils/types/objects/PortalFeePaymentDerogationDTO";

export const FEE_PAYMENT_DEROGATION_STATUS_LABEL_MAP: Record<FeePaymentDerogationStatus, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
};

export const FEE_PAYMENT_DEROGATION_STATUS_OPTIONS: {
  value: FeePaymentDerogationStatus;
  label: string;
}[] = [
  { value: "pending", label: "En attente" },
  { value: "approved", label: "Approuvé" },
  { value: "rejected", label: "Rejeté" },
];
