import { formatCurrency, formatShortDate } from "@/lib/format";
import type { PortalTransportInvoiceDTO } from "@/utils/types/objects/PortalTransportInvoiceDTO";
import { Text, View } from "react-native";
import { TRANSPORT_INVOICE_PAYMENT_METHOD_LABEL_MAP } from "./transport-invoice-status";
import { TransportInvoiceStatusPill } from "./transport-invoice-status-pill";

type InvoicePaymentsListProps = {
  invoices: PortalTransportInvoiceDTO[];
};

export function InvoicePaymentsList({ invoices }: InvoicePaymentsListProps) {
  const invoicesWithPayments = invoices.filter(
    (invoice) => (invoice.payments?.length ?? 0) > 0,
  );

  if (invoicesWithPayments.length === 0) {
    return (
      <View className="items-center justify-center px-6 py-16">
        <Text className="text-sm text-faint text-center">
          Aucun paiement n&apos;a été enregistré pour les factures affichées.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3 px-4 mt-3">
      {invoicesWithPayments.map((invoice) => {
        const payments = invoice.payments ?? [];
        const currency = invoice.currency ?? "USD";

        return (
          <View
            key={invoice.id}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <View className="flex-row items-center justify-between gap-2 px-4 py-3 bg-subtle">
              <View className="flex-row items-center gap-2 flex-1">
                <Text className="text-sm font-medium text-foreground flex-1" numberOfLines={1}>
                  {invoice.invoiceNumber ?? invoice.code ?? "Facture"}
                </Text>
                <TransportInvoiceStatusPill status={invoice.status} />
              </View>
              <Text className="text-sm font-semibold text-foreground">
                {formatCurrency(invoice.amountPaid, currency)}
              </Text>
            </View>

            {payments.map((payment, index) => {
              const methodLabel = payment.paymentMethod
                ? (TRANSPORT_INVOICE_PAYMENT_METHOD_LABEL_MAP[payment.paymentMethod] ??
                  payment.paymentMethod)
                : null;
              const metaParts = [methodLabel, payment.payerName].filter(
                (part): part is string => Boolean(part),
              );

              return (
                <View
                  key={payment.id}
                  className={`px-4 py-2.5 ${index > 0 ? "border-t border-divider" : ""}`}
                >
                  <View className="flex-row items-center justify-between gap-2">
                    <Text className="text-xs text-muted-foreground">
                      {formatShortDate(payment.paymentDate)}
                    </Text>
                    <Text className="text-sm font-medium text-foreground">
                      {formatCurrency(payment.amount, payment.currency ?? currency)}
                    </Text>
                  </View>
                  {(metaParts.length > 0 || payment.paymentReference) && (
                    <View className="flex-row items-center justify-between gap-2 mt-0.5">
                      {metaParts.length > 0 && (
                        <Text className="text-xs text-faint flex-1" numberOfLines={1}>
                          {metaParts.join(" · ")}
                        </Text>
                      )}
                      {payment.paymentReference && (
                        <Text className="text-xs text-faint" numberOfLines={1}>
                          Réf. {payment.paymentReference}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
