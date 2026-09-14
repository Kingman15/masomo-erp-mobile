import { usePortalFeePayment } from "@/hooks/queries/items/fee-payment";
import { formatDateTime, formatShortDate } from "@/lib/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { getFeePaymentDesignation, getFeePaymentInstallmentLabel } from "./fee-payment-designation";
import { FeePaymentStatusPill } from "./fee-payment-status-pill";

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

export function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedStudent } = usePortalSelection();

  const {
    portalFeePayment: feePayment,
    portalFeePaymentIsLoading,
    portalFeePaymentError,
    loadPortalFeePayment,
  } = usePortalFeePayment({ studentId: selectedStudent?.id, feePaymentId: id });

  const feePaymentRecords = feePayment?.feePaymentRecords ?? [];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Détail du paiement" }} />

      <View className="flex-1 bg-white">
        {portalFeePaymentIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalFeePaymentError || !feePayment ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Ce paiement n&apos;est pas accessible.
            </Text>
            <Pressable
              onPress={() => loadPortalFeePayment()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 text-xl font-semibold text-black" numberOfLines={2}>
                {getFeePaymentDesignation(feePayment)}
              </Text>
              <FeePaymentStatusPill
                status={feePayment.paymentStatus}
                label={feePayment.paymentStatusStr}
              />
            </View>

            {getFeePaymentInstallmentLabel(feePayment) && (
              <Text className="text-sm text-gray-400 mt-1">
                {getFeePaymentInstallmentLabel(feePayment)}
              </Text>
            )}

            <SectionTitle>Informations</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow icon="receipt-outline" label="N° Reçu" value={feePayment.receiptNumber} />
              <InfoRow icon="cash-outline" label="Devise" value={feePayment.currency?.isoCode} />
              <InfoRow icon="calendar-outline" label="Date butoir" value={formatShortDate(feePayment.dueDate)} />
              <InfoRow icon="pricetag-outline" label="Montant dû" value={feePayment.amountDueStr} />
              <InfoRow icon="checkmark-circle-outline" label="Montant payé" value={feePayment.amountPaidStr} />
              <InfoRow icon="alert-circle-outline" label="Montant restant" value={feePayment.amountRemainingStr} />
              <InfoRow icon="time-outline" label="Dernier paiement" value={formatShortDate(feePayment.lastPaymentDate)} />
            </View>

            {feePayment.comments && (
              <>
                <SectionTitle>Commentaires</SectionTitle>
                <Text className="text-sm text-black">{feePayment.comments}</Text>
              </>
            )}

            {feePayment.studentFeeOverrideId && (
              <>
                <SectionTitle>Modification appliquée</SectionTitle>
                <View className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-1">
                  <InfoRow
                    icon="swap-horizontal-outline"
                    label="Type"
                    value={feePayment.appliedOverrideTypeStr}
                  />
                  <InfoRow
                    icon="pricetag-outline"
                    label="Valeur"
                    value={feePayment.appliedOverrideValueStr}
                  />
                  <InfoRow
                    icon="cash-outline"
                    label="Montant initial"
                    value={feePayment.appliedOriginalAmountStr}
                  />
                  <InfoRow
                    icon="pricetags-outline"
                    label="Montant remise"
                    value={feePayment.appliedDiscountAmountStr}
                  />
                </View>
              </>
            )}

            <SectionTitle>Versements</SectionTitle>
            {feePaymentRecords.length > 0 ? (
              <View className="gap-3">
                {feePaymentRecords.map((record) => (
                  <View key={record.id} className="rounded-xl border border-gray-100 px-4 py-3">
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="text-sm font-medium text-black">
                        {record.amountPaid
                          ? `${record.amountPaid} ${record.currency?.isoCode ?? ""}`.trim()
                          : "Versement"}
                      </Text>
                      {record.paymentMethodStr && (
                        <View className="px-2.5 py-1 rounded-full bg-gray-100">
                          <Text className="text-xs font-medium text-gray-600">
                            {record.paymentMethodStr}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(record.paymentDate)}
                      {record.transactionReference ? ` · Réf. ${record.transactionReference}` : ""}
                    </Text>

                    {record.comments && (
                      <Text className="text-sm text-black mt-1">{record.comments}</Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-gray-400">
                Aucun versement n&apos;est enregistré pour ce paiement.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
