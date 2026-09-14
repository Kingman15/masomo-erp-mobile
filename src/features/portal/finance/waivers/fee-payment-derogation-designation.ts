import type { PortalFeePaymentDerogationDTO } from "@/utils/types/objects/PortalFeePaymentDerogationDTO";

export function getFeePaymentDerogationDesignation(
  feePaymentDerogation: PortalFeePaymentDerogationDTO,
): string {
  return (
    feePaymentDerogation.feeInstallment?.feeAssignment?.fee?.designation ??
    "Dérogation de frais"
  );
}

export function getFeePaymentDerogationInstallmentLabel(
  feePaymentDerogation: PortalFeePaymentDerogationDTO,
): string | null {
  const installmentNumber = feePaymentDerogation.feeInstallment?.installmentNumber;
  return installmentNumber != null ? `Tranche ${installmentNumber}` : null;
}
