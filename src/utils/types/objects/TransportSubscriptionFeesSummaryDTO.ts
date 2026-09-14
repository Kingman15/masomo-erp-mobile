import type { TransportSubscriptionStatus } from "../TransportSubscription";
import type { TransportSubscriptionLegDirection } from "../TransportSubscriptionLeg";

export type TransportSubscriptionFeeBillingPeriod =
  | "weekly"
  | "monthly"
  | "trimester"
  | "semester"
  | "annual"
  | "custom";

// L'API renvoie "partially_paid" en snake_case (cf. TransportInvoice::STATUS_PARTIALLY_PAID côté api/) —
// le type web déclare par erreur "partiallyPaid", on s'aligne ici sur la valeur réelle de l'API.
export type TransportInvoicePaymentStatus = "unpaid" | "partially_paid" | "paid";

export type TransportSubscriptionFeePaymentStatusFilter = Extract<
  TransportInvoicePaymentStatus,
  "unpaid" | "paid"
>;

export interface TransportSubscriptionFeePlan {
  scope: "subscription" | "leg";
  legDirection: TransportSubscriptionLegDirection | null;
  name: string;
  billingPeriod: TransportSubscriptionFeeBillingPeriod | null;
  amount: string;
  currency: string;
}

export interface TransportSubscriptionFeeItem {
  id: string;
  periodStart: string | null;
  periodEnd: string | null;
  billingPeriod: TransportSubscriptionFeeBillingPeriod | null;
  amountNet: string | null;
  currency: string | null;
  invoicePaymentStatus: TransportInvoicePaymentStatus | null;
}

export interface TransportSubscriptionFeesSummaryDTO {
  subscription: {
    id: string;
    status: TransportSubscriptionStatus | null;
    startDate: string | null;
    endDate: string | null;
    plans: TransportSubscriptionFeePlan[];
  } | null;
  fees: TransportSubscriptionFeeItem[];
  meta: {
    totalFees: number;
    totalAmountNet: string;
  };
}
