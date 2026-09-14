import { FilterButton } from "@/components/list/filter-button";
import { usePortalFeePaymentDerogations } from "@/hooks/queries/items/fee-payment-derogation";
import type { PortalFeePaymentDerogationDTO } from "@/utils/types/objects/PortalFeePaymentDerogationDTO";
import { Stack, router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { defaultWaiversFilters, type WaiversFiltersForm } from "./waivers-filters";
import { WaiversFilterPanel } from "./waivers-filter-panel";
import { WaiverRow } from "./waiver-row";

export function WaiversScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const [filters, setFilters] = useState<WaiversFiltersForm>(defaultWaiversFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && selectedSchoolClass?.id,
  );

  const {
    portalFeePaymentDerogations,
    portalFeePaymentDerogationsError,
    portalFeePaymentDerogationsIsLoading,
    portalFeePaymentDerogationsIsFetching,
    loadPortalFeePaymentDerogations,
  } = usePortalFeePaymentDerogations({
    studentId: selectedStudent?.id,
    filters: {
      schoolYearId: selectedSchoolYear?.id,
      schoolClassId: selectedSchoolClass?.id,
      status: filters.status,
      inProgress: filters.inProgress,
    },
    enabled: filtersAreComplete,
  });

  const activeFilterCount = useMemo(
    () =>
      (filters.status ? 1 : 0) +
      (filters.inProgress !== defaultWaiversFilters.inProgress ? 1 : 0),
    [filters],
  );

  const handlePressWaiver = (feePaymentDerogation: PortalFeePaymentDerogationDTO) => {
    router.push(`/portal/menu/finance/waivers/${feePaymentDerogation.id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Dérogations",
        }}
      />

      <View className="flex-1 bg-gray-50">
        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher ses dérogations.
            </Text>
          </View>
        ) : (
          <>
            <View className="flex-row items-center gap-3 px-4 pt-3 pb-2">
              <FilterButton
                fullWidth
                activeCount={activeFilterCount}
                onPress={() => setFiltersOpen((open) => !open)}
              />
            </View>

            {filtersOpen && (
              <WaiversFilterPanel
                value={filters}
                onApply={setFilters}
                onClose={() => setFiltersOpen(false)}
              />
            )}

            {portalFeePaymentDerogationsIsLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
              </View>
            ) : portalFeePaymentDerogationsError ? (
              <View className="flex-1 items-center justify-center px-6 gap-3">
                <Text className="text-sm text-gray-500 text-center">
                  Impossible de charger les dérogations.
                </Text>
                <Pressable
                  onPress={() => loadPortalFeePaymentDerogations()}
                  className="h-10 px-4 rounded-lg bg-black items-center justify-center"
                >
                  <Text className="text-white font-medium">Réessayer</Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
                refreshControl={
                  <RefreshControl
                    refreshing={portalFeePaymentDerogationsIsFetching}
                    onRefresh={() => void loadPortalFeePaymentDerogations()}
                  />
                }
              >
                {portalFeePaymentDerogations.length === 0 ? (
                  <View className="items-center justify-center px-6 py-16">
                    <Text className="text-sm text-gray-400 text-center">
                      Aucune dérogation de paiement de frais n&apos;a été enregistrée
                      pour cet élève.
                    </Text>
                  </View>
                ) : (
                  portalFeePaymentDerogations.map((feePaymentDerogation) => (
                    <WaiverRow
                      key={feePaymentDerogation.id}
                      feePaymentDerogation={feePaymentDerogation}
                      onPress={handlePressWaiver}
                    />
                  ))
                )}
              </ScrollView>
            )}
          </>
        )}
      </View>
    </>
  );
}
