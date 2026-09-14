import { usePortalFeePaymentDerogation } from "@/hooks/queries/items/fee-payment-derogation";
import { formatShortDate } from "@/lib/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import {
  getFeePaymentDerogationDesignation,
  getFeePaymentDerogationInstallmentLabel,
} from "./fee-payment-derogation-designation";
import { FeePaymentDerogationStatusPill } from "./fee-payment-derogation-status-pill";

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

export function WaiverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedStudent } = usePortalSelection();

  const {
    portalFeePaymentDerogation: feePaymentDerogation,
    portalFeePaymentDerogationIsLoading,
    portalFeePaymentDerogationError,
    loadPortalFeePaymentDerogation,
  } = usePortalFeePaymentDerogation({ studentId: selectedStudent?.id, feePaymentDerogationId: id });

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Détail de la dérogation" }} />

      <View className="flex-1 bg-white">
        {portalFeePaymentDerogationIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalFeePaymentDerogationError || !feePaymentDerogation ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Cette dérogation n&apos;est pas accessible.
            </Text>
            <Pressable
              onPress={() => loadPortalFeePaymentDerogation()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 text-xl font-semibold text-black" numberOfLines={2}>
                {getFeePaymentDerogationDesignation(feePaymentDerogation)}
              </Text>
              <FeePaymentDerogationStatusPill
                status={feePaymentDerogation.status}
                label={feePaymentDerogation.statusStr}
              />
            </View>

            {getFeePaymentDerogationInstallmentLabel(feePaymentDerogation) && (
              <Text className="text-sm text-gray-400 mt-1">
                {getFeePaymentDerogationInstallmentLabel(feePaymentDerogation)}
              </Text>
            )}

            <SectionTitle>Informations</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow icon="barcode-outline" label="Code" value={feePaymentDerogation.code} />
              <InfoRow
                icon="calendar-outline"
                label="Date demande"
                value={formatShortDate(feePaymentDerogation.requestDate)}
              />
              <InfoRow
                icon="calendar-outline"
                label="Date expiration"
                value={formatShortDate(feePaymentDerogation.expirationDate)}
              />
              <InfoRow
                icon="checkmark-done-outline"
                label="Date décision"
                value={formatShortDate(feePaymentDerogation.decisionDate)}
              />
              <InfoRow
                icon="person-outline"
                label="Demandeur"
                value={feePaymentDerogation.guardian?.fullName}
              />
            </View>

            {feePaymentDerogation.reason && (
              <>
                <SectionTitle>Motif</SectionTitle>
                <Text className="text-sm text-black">{feePaymentDerogation.reason}</Text>
              </>
            )}

            {feePaymentDerogation.comments && (
              <>
                <SectionTitle>Commentaires</SectionTitle>
                <Text className="text-sm text-black">{feePaymentDerogation.comments}</Text>
              </>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
