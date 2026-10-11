import { useFeeRoutes } from "./use-fee-routes";
import { useDerogationById } from "@/hooks/queries/items/fee-payment";
import { useCan } from "@/hooks/use-can";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatShortDate } from "@/lib/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { getEnrollmentLabel, getSchoolClassLabel } from "../attendance/attendance-labels";
import { DerogationProcessDialog } from "./derogation-process-dialog";
import { DerogationStatusPill } from "./derogation-status-pill";

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between gap-4 py-2.5 border-b border-divider">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-sm text-foreground text-right">{value}</Text>
    </View>
  );
}

// Détail d'une dérogation ; le traitement n'est proposé que sur une demande en attente, avec derogations.process.
export function DerogationDetailScreen() {
  const feeRoutes = useFeeRoutes();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { derogation, derogationIsLoading, derogationError, loadDerogation } = useDerogationById(id);
  const canProcess = useCan("schoolFees.derogations.process");
  const [processOpen, setProcessOpen] = useState(false);

  return (
    <>
      <Stack.Screen options={{ title: "Dérogation" }} />

      {derogationIsLoading ? (
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator />
        </View>
      ) : derogationError || !derogation ? (
        <View className="flex-1 items-center justify-center px-6 gap-3 bg-background">
          <Text className="text-sm text-muted-foreground text-center">Impossible de charger la dérogation.</Text>
          <Pressable
            onPress={() => loadDerogation()}
            className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
          >
            <Text className="text-background font-medium">Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xl font-semibold text-foreground">{getEnrollmentLabel(derogation.enrollment)}</Text>
              <Text className="text-sm text-muted-foreground mt-0.5">
                {getSchoolClassLabel(derogation.enrollment?.schoolClass)}
              </Text>
            </View>
            <DerogationStatusPill status={derogation.status} />
          </View>

          <View className="mt-5">
            <InfoRow label="Tranche" value={derogation.feeInstallment?.fullDesignation} />
            <InfoRow label="N°" value={derogation.code} />
            <InfoRow label="Demandée le" value={formatShortDate(derogation.requestDate)} />
            <InfoRow label="Décision le" value={derogation.decisionDate ? formatShortDate(derogation.decisionDate) : null} />
            <InfoRow
              label={derogation.status === "approved" ? "Délai accordé jusqu'au" : "Délai demandé jusqu'au"}
              value={derogation.expirationDate ? formatShortDate(derogation.expirationDate) : null}
            />
          </View>

          {derogation.reason ? (
            <>
              <Text className="text-xs font-semibold text-muted-foreground uppercase mt-6 mb-1">Motif</Text>
              <Text className="text-sm text-foreground">{derogation.reason}</Text>
            </>
          ) : null}

          {derogation.comments ? (
            <>
              <Text className="text-xs font-semibold text-muted-foreground uppercase mt-6 mb-1">Commentaire</Text>
              <Text className="text-sm text-foreground">{derogation.comments}</Text>
            </>
          ) : null}

          {derogation.enrollmentId && (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(feeRoutes.studentFees(derogation.enrollmentId as string))}
              className="mt-6 h-12 px-4 rounded-xl border border-border bg-card flex-row items-center gap-3 active:bg-subtle"
            >
              <Ionicons name="wallet-outline" size={18} color={colors.foreground} />
              <Text className="flex-1 text-sm font-medium text-foreground">{"Situation des frais de l'élève"}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}

          {canProcess && derogation.status === "pending" && (
            <Pressable
              onPress={() => setProcessOpen(true)}
              className="mt-4 h-12 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Traiter la demande</Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      <DerogationProcessDialog
        derogation={derogation ?? null}
        visible={processOpen}
        onClose={() => setProcessOpen(false)}
      />
    </>
  );
}
