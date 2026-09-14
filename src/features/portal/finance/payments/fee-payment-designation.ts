import type { PortalFeePaymentDTO } from "@/utils/types/objects/PortalFeePaymentDTO";

export function getFeePaymentDesignation(feePayment: PortalFeePaymentDTO): string {
  return feePayment.feeInstallment?.feeAssignment?.fee?.designation ?? "Paiement de frais";
}

export function getFeePaymentInstallmentLabel(feePayment: PortalFeePaymentDTO): string | null {
  const installmentNumber = feePayment.feeInstallment?.installmentNumber;
  return installmentNumber != null ? `Tranche ${installmentNumber}` : null;
}
