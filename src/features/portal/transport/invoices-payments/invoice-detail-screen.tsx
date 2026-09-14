import { usePortalTransportInvoice } from "@/hooks/queries/items/portal-transport-invoice";
import { formatCurrency, formatShortDate } from "@/lib/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { TRANSPORT_INVOICE_PAYMENT_METHOD_LABEL_MAP } from "./transport-invoice-status";
import { TransportInvoiceStatusPill } from "./transport-invoice-status-pill";

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null | undefined;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  if (!value) return null;

  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color="#6B7280" />
      <Text className="text-xs text-gray-500 w-32">{label}</Text>
      <Text className="flex-1 text-sm text-black">{value}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-500 uppercase mb-1 mt-4">
      {children}
    </Text>
  );
}

export function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedStudent } = usePortalSelection();

  const {
    portalTransportInvoice: invoice,
    portalTransportInvoiceIsLoading,
    portalTransportInvoiceError,
    loadPortalTransportInvoice,
  } = usePortalTransportInvoice({ studentId: selectedStudent?.id, invoiceId: id });

  const currency = invoice?.currency ?? "USD";
  const lines = invoice?.lines ?? [];
  const payments = invoice?.payments ?? [];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Facture de transport" }} />

      <View className="flex-1 bg-white">
        {portalTransportInvoiceIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalTransportInvoiceError || !invoice ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Cette facture n&apos;est pas accessible.
            </Text>
            <Pressable
              onPress={() => loadPortalTransportInvoice()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 text-xl font-semibold text-black" numberOfLines={2}>
                {invoice.invoiceNumber ?? invoice.code ?? "Facture"}
              </Text>
              <TransportInvoiceStatusPill status={invoice.status} />
            </View>

            <SectionTitle>Informations</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow
                icon="calendar-outline"
                label="Émise le"
                value={formatShortDate(invoice.issuedAt)}
              />
              <InfoRow
                icon="alarm-outline"
                label="Butoir"
                value={formatShortDate(invoice.dueDate)}
              />
              <InfoRow
                icon="cash-outline"
                label="Montant net"
                value={formatCurrency(invoice.netAmount, currency)}
              />
              <InfoRow
                icon="wallet-outline"
                label="Restant dû"
                value={formatCurrency(invoice.amountRemaining, currency)}
              />
              <InfoRow
                icon="pricetag-outline"
                label="Remise"
                value={formatCurrency(invoice.discountAmount, currency)}
              />
              <InfoRow
                icon="receipt-outline"
                label="Taxe"
                value={formatCurrency(invoice.taxAmount, currency)}
              />
              <InfoRow
                icon="checkmark-done-outline"
                label="Payé"
                value={formatCurrency(invoice.amountPaid, currency)}
              />
            </View>

            {invoice.description && (
              <>
                <SectionTitle>Description</SectionTitle>
                <Text className="text-sm text-black">{invoice.description}</Text>
              </>
            )}

            <SectionTitle>Lignes</SectionTitle>
            {lines.length > 0 ? (
              <View className="gap-2">
                {lines.map((line) => (
                  <View
                    key={line.id}
                    className="rounded-xl border border-gray-100 px-4 py-3"
                  >
                    <Text className="text-sm font-medium text-black">
                      {line.label ?? "—"}
                    </Text>
                    <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                      <Text className="text-xs text-gray-400">
                        PU {formatCurrency(line.unitPrice, currency)}
                      </Text>
                      {line.discountAmount !== null && Number(line.discountAmount) > 0 && (
                        <Text className="text-xs text-gray-400">
                          Remise {formatCurrency(line.discountAmount, currency)}
                        </Text>
                      )}
                      {line.taxAmount !== null && Number(line.taxAmount) > 0 && (
                        <Text className="text-xs text-gray-400">
                          Taxe {formatCurrency(line.taxAmount, currency)}
                        </Text>
                      )}
                    </View>
                    <View className="flex-row items-center justify-between mt-1.5">
                      <Text className="text-xs text-gray-500">Total</Text>
                      <Text className="text-sm font-semibold text-black">
                        {formatCurrency(line.total, currency)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-gray-400">
                Aucune ligne n&apos;est associée à cette facture.
              </Text>
            )}

            <SectionTitle>Paiements</SectionTitle>
            {payments.length > 0 ? (
              <View className="gap-2">
                {payments.map((payment) => (
                  <View
                    key={payment.id}
                    className="rounded-xl border border-gray-100 px-4 py-3"
                  >
                    <View className="flex-row items-center justify-between gap-3">
                      <Text
                        className="flex-1 text-sm font-medium text-black"
                        numberOfLines={1}
                      >
                        {payment.paymentMethod
                          ? (TRANSPORT_INVOICE_PAYMENT_METHOD_LABEL_MAP[
                              payment.paymentMethod
                            ] ?? payment.paymentMethod)
                          : "Paiement"}
                      </Text>
                      <Text className="text-sm font-semibold text-black">
                        {formatCurrency(payment.amount, payment.currency ?? currency)}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400 mt-1">
                      {formatShortDate(payment.paymentDate)}
                      {payment.payerName ? ` · ${payment.payerName}` : ""}
                    </Text>
                    {payment.paymentReference && (
                      <Text className="text-xs text-gray-400 mt-0.5">
                        Réf. {payment.paymentReference}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-gray-400">
                Aucun paiement n&apos;a été enregistré pour cette facture.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
