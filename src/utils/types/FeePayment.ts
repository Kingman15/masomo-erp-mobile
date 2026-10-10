import { Enrollment } from "./Enrollment";

// Ligne de paiement d'une tranche (dû / payé / reste), avec ses versements (consultation du personnel).
export interface FeePaymentRecord {
  id: string;
  code: string | null;
  feePaymentId: string;
  amountPaid: string | null;
  paymentDate: string | null;
  paymentMethod: string | null;
  paymentMethodStr: string | null;
  transactionReference: string | null;
  comments: string | null;
  originStr: string | null;
}

export interface FeePaymentDerogation {
  id: string;
  code: string | null;
  enrollmentId: string | null;
  feeInstallmentId: string | null;
  requestDate: string | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | null;
  statusStr: string | null;
  decisionDate: string | null;
  expirationDate: string | null;
  comments: string | null;
  feeInstallment?: { id: string; fullDesignation: string | null } | null;
}

export interface FeePayment {
  id: string;
  code: string | null;
  receiptNumber: string | null;
  enrollmentId: string | null;
  feeInstallmentId: string | null;
  currency: string | null;
  dueDate: string | null;
  lastPaymentDate: string | null;
  paymentStatus: string | null;
  paymentStatusStr: string | null;
  comments: string | null;
  amountDueStr: string | null;
  amountPaidStr: string | null;
  amountRemainingStr: string | null;
  appliedDiscountAmountStr: string | null;

  enrollment?: Enrollment | null;
  feeInstallment?: { id: string; fullDesignation: string | null; dueDate: string | null } | null;
  feePaymentRecords?: FeePaymentRecord[];
  feePaymentDerogations?: FeePaymentDerogation[];
}
