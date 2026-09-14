export type FeePaymentDerogationStatus = "pending" | "approved" | "rejected";

export interface PortalFeePaymentDerogationDTO {
  id: string;
  code: string | null;
  requestDate: string | null;
  reason: string | null;
  status: FeePaymentDerogationStatus | null;
  statusStr: string | null;
  decisionDate: string | null;
  expirationDate: string | null;
  comments: string | null;
  guardian: { fullName: string | null } | null;
  feeInstallment: {
    installmentNumber: number | null;
    feeAssignment: {
      fee: { designation: string | null } | null;
    } | null;
  } | null;
}
