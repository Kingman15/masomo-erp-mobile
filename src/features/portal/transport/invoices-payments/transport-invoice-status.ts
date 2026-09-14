import type {
  PortalTransportInvoiceStatus,
  TransportInvoicePaymentMethod,
  TransportInvoiceStatus,
} from "@/utils/types/objects/PortalTransportInvoiceDTO";

export const TRANSPORT_INVOICE_STATUS_LABEL_MAP: Record<TransportInvoiceStatus, string> = {
  draft: "Brouillon",
  issued: "Émis",
  paid: "Payé",
  partially_paid: "Partiellement payé",
  cancelled: "Annulé",
};

export const TRANSPORT_INVOICE_PAYMENT_METHOD_LABEL_MAP: Record<
  TransportInvoicePaymentMethod,
  string
> = {
  cash: "Espèces",
  transfer: "Virement",
  card: "Carte",
  cheque: "Chèque",
  mobile_money: "Mobile Money",
};

export const TRANSPORT_INVOICE_PORTAL_STATUS_OPTIONS: {
  value: PortalTransportInvoiceStatus;
  label: string;
}[] = [
  { value: "issued", label: "Émis" },
  { value: "paid", label: "Payé" },
  { value: "partially_paid", label: "Partiellement payé" },
  { value: "cancelled", label: "Annulé" },
];
