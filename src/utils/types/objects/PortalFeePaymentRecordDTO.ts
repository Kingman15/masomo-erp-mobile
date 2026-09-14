export interface PortalFeePaymentRecordDTO {
  id: string;
  amountPaid: string | null;
  paymentDate: string | null;
  paymentMethodStr: string | null;
  transactionReference: string | null;
  comments: string | null;
  currency: { isoCode: string | null } | null;
}
