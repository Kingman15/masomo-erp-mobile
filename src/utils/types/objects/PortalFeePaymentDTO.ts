import { PortalFeePaymentRecordDTO } from "./PortalFeePaymentRecordDTO";

export type FeePaymentStatus = "pending" | "partial" | "paid";

export interface PortalFeePaymentDTO {
  id: string;
  receiptNumber: string | null;
  dueDate: string | null;
  lastPaymentDate: string | null;
  comments: string | null;
  paymentStatus: FeePaymentStatus;
  paymentStatusStr: string | null;
  amountDue: string | null;
  amountPaid: string | null;
  amountRemaining: string | null;
  amountDueStr: string | null;
  amountPaidStr: string | null;
  amountRemainingStr: string | null;
  studentFeeOverrideId: string | null;
  appliedOverrideTypeStr: string | null;
  appliedOverrideValueStr: string | null;
  appliedOriginalAmountStr: string | null;
  appliedDiscountAmountStr: string | null;
  feeInstallment: {
    installmentNumber: number | null;
    feeAssignment: {
      fee: { designation: string | null } | null;
    } | null;
  } | null;
  currency: { isoCode: string | null } | null;
  feePaymentRecords: PortalFeePaymentRecordDTO[] | null;
}
