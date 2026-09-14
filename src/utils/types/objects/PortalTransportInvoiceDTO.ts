export type TransportInvoiceStatus =
  | "draft"
  | "issued"
  | "paid"
  | "partially_paid"
  | "cancelled";

export type PortalTransportInvoiceStatus = Exclude<TransportInvoiceStatus, "draft">;

export type TransportInvoicePaymentMethod =
  | "cash"
  | "transfer"
  | "card"
  | "cheque"
  | "mobile_money";

export interface PortalTransportInvoiceLineDTO {
  id: string;
  label: string | null;
  unitPrice: string | null;
  discountAmount: string | null;
  taxAmount: string | null;
  total: string | null;
}

export interface PortalTransportInvoicePaymentDTO {
  id: string;
  amount: number | null;
  currency: string | null;
  paymentDate: string | null;
  paymentMethod: TransportInvoicePaymentMethod | null;
  paymentReference: string | null;
  payerName: string | null;
  payerContact: string | null;
}

export interface PortalTransportInvoiceDTO {
  id: string;
  code: string | null;
  invoiceNumber: string | null;
  status: TransportInvoiceStatus | null;
  issuedAt: string | null;
  dueDate: string | null;
  netAmount: number | null;
  discountAmount: number | null;
  taxAmount: number | null;
  currency: string | null;
  description: string | null;
  amountPaid: number | null;
  amountRemaining: number | null;

  lines?: PortalTransportInvoiceLineDTO[] | null;
  payments?: PortalTransportInvoicePaymentDTO[] | null;
}
