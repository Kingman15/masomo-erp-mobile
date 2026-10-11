import { useFeeRoutes } from "./use-fee-routes";
import { ChipSelect } from "@/components/list/chip-select";
import { DrawerMenuButton } from "@/features/staff/drawer-menu-button";
import { useDerogationList } from "@/hooks/queries/items/fee-payment";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useCan } from "@/hooks/use-can";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatShortDate } from "@/lib/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { FeePaymentDerogationStatus } from "@/api/endpoints/feePayment";
import type { FeePaymentDerogation } from "@/utils/types/FeePayment";
import { FlashList } from "@shopify/flash-list";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { getEnrollmentLabel, getSchoolClassLabel } from "../attendance/attendance-labels";
import { DEROGATION_STATUS_LABELS, DerogationStatusPill } from "./derogation-status-pill";

function DerogationRow({ derogation }: { derogation: FeePaymentDerogation }) {
  const feeRoutes = useFeeRoutes();
  return (
    <Pressable
      onPress={() => router.push(feeRoutes.derogation(derogation.id))}
      className="px-4 py-3 border-b border-divider bg-card active:bg-subtle"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={1}>
          {getEnrollmentLabel(derogation.enrollment)}
        </Text>
        <DerogationStatusPill status={derogation.status} />
      </View>
      <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={1}>
        {[getSchoolClassLabel(derogation.enrollment?.schoolClass), derogation.feeInstallment?.fullDesignation]
          .filter(Boolean)
          .join(" · ")}
      </Text>
      <Text className="text-xs text-faint mt-1">
        {derogation.status === "approved" && derogation.expirationDate
          ? `Délai jusqu'au ${formatShortDate(derogation.expirationDate)}`
          : `Demandée le ${formatShortDate(derogation.requestDate)}`}
      </Text>
    </Pressable>
  );
}

// Dérogations (délais de paiement) de l'année en cours : les demandes en attente d'abord, puis la dernière demande (comme le web).
export function DerogationsScreen() {
  const feeRoutes = useFeeRoutes();
  const [status, setStatus] = useState<FeePaymentDerogationStatus | null>(null);
  const colors = useThemeColors();
  const canCreate = useCan("schoolFees.derogations.create");

  const { currentSchoolYear } = useCurrentSchoolYear();
  const { derogations, derogationsError, derogationsIsLoading, derogationsIsRefetching, loadDerogations } =
    useDerogationList({ schoolYearId: currentSchoolYear?.id, status });

  const sortedDerogations = useMemo(
    () =>
      [...(derogations ?? [])].sort(
        (a, b) =>
          Number(b.status === "pending") - Number(a.status === "pending") ||
          (b.requestDate ?? "").localeCompare(a.requestDate ?? ""),
      ),
    [derogations],
  );

  const renderDerogation = useCallback(
    ({ item }: { item: FeePaymentDerogation }) => <DerogationRow derogation={item} />,
    [],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Dérogations",
          headerLeft: () => <DrawerMenuButton />,
          headerRight: canCreate
            ? () => (
                <Pressable onPress={() => router.push(feeRoutes.newDerogation())} hitSlop={8}>
                  <Ionicons name="add-outline" size={26} color={colors.foreground} />
                </Pressable>
              )
            : undefined,
        }}
      />

      <View className="flex-1 bg-background">
        <View className="px-4 pt-3">
          <ChipSelect
            label="Statut"
            options={(Object.keys(DEROGATION_STATUS_LABELS) as FeePaymentDerogationStatus[]).map((key) => ({
              id: key,
              label: DEROGATION_STATUS_LABELS[key],
            }))}
            value={status}
            onChange={(next) => setStatus(next as FeePaymentDerogationStatus | null)}
          />
        </View>

        {derogationsIsLoading || !currentSchoolYear ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : derogationsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">Impossible de charger les dérogations.</Text>
            <Pressable
              onPress={() => loadDerogations()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={sortedDerogations}
            keyExtractor={(item) => item.id}
            renderItem={renderDerogation}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              <Text className="px-4 py-2 text-xs text-faint">
                {sortedDerogations.length} dérogation{sortedDerogations.length > 1 ? "s" : ""} · année{" "}
                {currentSchoolYear.title}
              </Text>
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-faint text-center">Aucune dérogation.</Text>
              </View>
            }
            refreshing={derogationsIsRefetching}
            onRefresh={loadDerogations}
          />
        )}
      </View>
    </>
  );
}
