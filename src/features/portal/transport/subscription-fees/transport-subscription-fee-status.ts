import type { TransportSubscriptionStatus } from "@/utils/types/TransportSubscription";
import type { TransportSubscriptionLegDirection } from "@/utils/types/TransportSubscriptionLeg";
import type {
  TransportInvoicePaymentStatus,
  TransportSubscriptionFeeBillingPeriod,
  TransportSubscriptionFeePaymentStatusFilter,
} from "@/utils/types/objects/TransportSubscriptionFeesSummaryDTO";

export const TRANSPORT_SUBSCRIPTION_STATUS_LABEL_MAP: Record<TransportSubscriptionStatus, string> = {
  pending: "En attente",
  active: "Actif",
  suspended: "Suspendu",
  cancelled: "Annulé",
  expired: "Expiré",
};

export const TRANSPORT_SUBSCRIPTION_LEG_DIRECTION_LABEL_MAP: Record<
  TransportSubscriptionLegDirection,
  string
> = {
  inbound: "Aller",
  outbound: "Retour",
};

export const TRANSPORT_SUBSCRIPTION_FEE_BILLING_PERIOD_LABEL_MAP: Record<
  TransportSubscriptionFeeBillingPeriod,
  string
> = {
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
  trimester: "Trimestriel",
  semester: "Semestriel",
  annual: "Annuel",
  custom: "Personnalisé",
};

export const TRANSPORT_INVOICE_PAYMENT_STATUS_LABEL_MAP: Record<
  TransportInvoicePaymentStatus,
  string
> = {
  unpaid: "Non payé",
  partially_paid: "Partiellement payé",
  paid: "Payé",
};

export const TRANSPORT_SUBSCRIPTION_FEE_PAYMENT_STATUS_FILTER_OPTIONS: {
  value: TransportSubscriptionFeePaymentStatusFilter;
  label: string;
}[] = [
  { value: "unpaid", label: TRANSPORT_INVOICE_PAYMENT_STATUS_LABEL_MAP.unpaid },
  { value: "paid", label: TRANSPORT_INVOICE_PAYMENT_STATUS_LABEL_MAP.paid },
];
