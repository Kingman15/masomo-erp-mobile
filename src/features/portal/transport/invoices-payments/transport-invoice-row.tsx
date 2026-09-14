import { formatCurrency, formatShortDate } from "@/lib/format";
import type { PortalTransportInvoiceDTO } from "@/utils/types/objects/PortalTransportInvoiceDTO";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { TransportInvoiceStatusPill } from "./transport-invoice-status-pill";

type TransportInvoiceRowProps = {
  invoice: PortalTransportInvoiceDTO;
  onPress?: (invoice: PortalTransportInvoiceDTO) => void;
};

function TransportInvoiceRowComponent({ invoice, onPress }: TransportInvoiceRowProps) {
  const currency = invoice.currency ?? "USD";
  const paymentsCount = invoice.payments?.length ?? 0;
  const hasRemaining =
    invoice.amountRemaining !== null && Number(invoice.amountRemaining) > 0;

  return (
    <Pressable
      onPress={() => onPress?.(invoice)}
      className="mx-4 mt-3 px-4 py-3 rounded-xl border border-gray-200 bg-white"
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm font-medium text-black" numberOfLines={1}>
          {invoice.invoiceNumber ?? invoice.code ?? "Facture"}
        </Text>
        <TransportInvoiceStatusPill status={invoice.status} />
      </View>

      <View className="flex-row items-center justify-between gap-3 mt-2">
        <Text className="text-xs text-gray-400">
          Émise le {formatShortDate(invoice.issuedAt)}
        </Text>
        <Text className="text-xs text-gray-400">
          Butoir {formatShortDate(invoice.dueDate)}
        </Text>
      </View>

      <View className="flex-row items-baseline justify-between gap-3 mt-1.5">
        <Text className="text-xs text-gray-400">Montant net</Text>
        <Text className="text-sm font-semibold text-black">
          {formatCurrency(invoice.netAmount, currency)}
        </Text>
      </View>

      {hasRemaining && (
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-xs text-gray-400">Restant dû</Text>
          <Text className="text-xs font-medium text-black">
            {formatCurrency(invoice.amountRemaining, currency)}
          </Text>
        </View>
      )}

      {paymentsCount > 0 && (
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-xs text-gray-400">Paiements</Text>
          <View className="px-2 py-0.5 rounded-full bg-green-100">
            <Text className="text-[10px] font-medium text-green-700">
              {paymentsCount} paiement{paymentsCount > 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export const TransportInvoiceRow = memo(TransportInvoiceRowComponent);
