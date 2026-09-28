import { usePortalFeePaymentDerogation } from "@/hooks/queries/items/fee-payment-derogation";
import { useThemeColors } from "@/hooks/use-theme-colors";
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
  const colors = useThemeColors();
  if (!value) return null;

  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color={colors.mutedForeground} />
      <Text className="text-xs text-muted-foreground w-32">{label}</Text>
      <Text className="flex-1 text-sm text-foreground">{value}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase mb-1 mt-4">
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

      <View className="flex-1 bg-background">
        {portalFeePaymentDerogationIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalFeePaymentDerogationError || !feePaymentDerogation ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Cette dérogation n&apos;est pas accessible.
            </Text>
            <Pressable
              onPress={() => loadPortalFeePaymentDerogation()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 text-xl font-semibold text-foreground" numberOfLines={2}>
                {getFeePaymentDerogationDesignation(feePaymentDerogation)}
              </Text>
              <FeePaymentDerogationStatusPill
                status={feePaymentDerogation.status}
                label={feePaymentDerogation.statusStr}
              />
            </View>

            {getFeePaymentDerogationInstallmentLabel(feePaymentDerogation) && (
              <Text className="text-sm text-faint mt-1">
                {getFeePaymentDerogationInstallmentLabel(feePaymentDerogation)}
              </Text>
            )}

            <SectionTitle>Informations</SectionTitle>
            <View className="border-t border-divider pt-1">
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
                <Text className="text-sm text-foreground">{feePaymentDerogation.reason}</Text>
              </>
            )}

            {feePaymentDerogation.comments && (
              <>
                <SectionTitle>Commentaires</SectionTitle>
                <Text className="text-sm text-foreground">{feePaymentDerogation.comments}</Text>
              </>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
