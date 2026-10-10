import api from "@/api/client";
import { receiptPdf } from "@/api/endpoints/feePayment";
import { FeePaymentStatusPill } from "@/features/portal/finance/payments/fee-payment-status-pill";
import { useFeePaymentById } from "@/hooks/queries/items/fee-payment";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { handleApiError } from "@/lib/handle-api-error";
import { useIsOnline } from "@/lib/offline/use-offline-queue";
import type { FeePaymentStatus } from "@/utils/types/objects/PortalFeePaymentDTO";
import Ionicons from "@expo/vector-icons/Ionicons";
import { File, Paths } from "expo-file-system";
import { Stack, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { getEnrollmentLabel } from "../attendance/attendance-labels";

type InfoRowProps = { label: string; value: string | null | undefined };

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View className="flex-row items-center justify-between py-2.5 border-b border-divider">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-medium text-foreground">{value || "—"}</Text>
    </View>
  );
}

// Paiement d'une tranche (consultation) : montants, versements, reçu PDF partagé depuis l'appareil (pas d'impression).
export function FeePaymentDetailScreen() {
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { feePayment, feePaymentIsLoading, feePaymentError, loadFeePayment } =
    useFeePaymentById(id);
  const [isSharing, setIsSharing] = useState(false);

  const shareReceipt = async () => {
    if (!feePayment) return;
    setIsSharing(true);
    try {
      const buffer = await receiptPdf(api, feePayment.id);
      const file = new File(Paths.cache, `recu-${feePayment.receiptNumber ?? feePayment.id}.pdf`);
      file.write(new Uint8Array(buffer));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Partager le reçu",
        });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSharing(false);
    }
  };

  const records = feePayment?.feePaymentRecords ?? [];

  return (
    <>
      <Stack.Screen options={{ title: "Paiement" }} />

      {feePaymentIsLoading ? (
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator />
        </View>
      ) : feePaymentError || !feePayment ? (
        <View className="flex-1 items-center justify-center px-6 gap-3 bg-background">
          <Text className="text-sm text-muted-foreground text-center">
            Impossible de charger le paiement.
          </Text>
          <Pressable
            onPress={() => loadFeePayment()}
            className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
          >
            <Text className="text-background font-medium">Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 text-lg font-semibold text-foreground">
              {feePayment.feeInstallment?.fullDesignation ?? "Frais"}
            </Text>
            <FeePaymentStatusPill
              status={feePayment.paymentStatus as FeePaymentStatus | null}
              label={feePayment.paymentStatusStr}
            />
          </View>
          {feePayment.enrollment && (
            <Text className="text-sm text-muted-foreground mt-0.5">
              {getEnrollmentLabel(feePayment.enrollment)}
            </Text>
          )}

          <View className="mt-4 px-4 py-1 rounded-xl border border-border bg-card">
            <InfoRow label="N° de reçu" value={feePayment.receiptNumber} />
            <InfoRow label="Montant dû" value={feePayment.amountDueStr} />
            <InfoRow label="Payé" value={feePayment.amountPaidStr} />
            <InfoRow label="Reste" value={feePayment.amountRemainingStr} />
            <InfoRow
              label="Échéance"
              value={feePayment.dueDate ? formatShortDate(feePayment.dueDate) : null}
            />
          </View>

          <Text className="text-xs font-semibold text-muted-foreground uppercase mt-6 mb-1">
            Versements
          </Text>
          {records.length === 0 ? (
            <Text className="text-sm text-faint mt-2">Aucun versement.</Text>
          ) : (
            records.map((record) => (
              <View
                key={record.id}
                className="mt-2 px-4 py-3 rounded-xl border border-border bg-card"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-medium text-foreground">
                    {formatCurrency(record.amountPaid, feePayment.currency ?? undefined)}
                  </Text>
                  <Text className="text-xs text-faint">
                    {record.paymentDate ? formatShortDate(record.paymentDate) : "—"}
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground mt-1">
                  {[record.paymentMethodStr, record.transactionReference]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </Text>
              </View>
            ))
          )}

          {feePayment.comments ? (
            <View className="mt-4">
              <Text className="text-xs text-muted-foreground mb-1">Commentaire</Text>
              <Text className="text-sm text-foreground">{feePayment.comments}</Text>
            </View>
          ) : null}

          {records.length > 0 && (
            <Pressable
              accessibilityRole="button"
              onPress={() => void shareReceipt()}
              disabled={isSharing || !isOnline}
              className={`h-12 rounded-lg items-center justify-center flex-row gap-2 mt-6 ${
                isSharing || !isOnline ? "bg-gray-300 dark:bg-zinc-700" : "bg-foreground"
              }`}
            >
              {isSharing ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <>
                  <Ionicons name="share-outline" size={18} color={colors.background} />
                  <Text className="text-background font-medium">Partager le reçu (PDF)</Text>
                </>
              )}
            </Pressable>
          )}
        </ScrollView>
      )}
    </>
  );
}
