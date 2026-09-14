import { FilterButton } from "@/components/list/filter-button";
import {
  useFeeScheduleSummary,
  useFeeSchedules,
} from "@/hooks/queries/items/fee-payment";
import { Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { FeeScheduleCard } from "./fee-schedule-card";
import { FeeScheduleSummaryCard } from "./fee-schedule-summary-card";
import { FeesFilterPanel } from "./fees-filter-panel";
import { emptyFeesFilters, type FeesFiltersForm } from "./fees-filters";

export function FeesScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const [filters, setFilters] = useState<FeesFiltersForm>(emptyFeesFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && selectedSchoolClass?.id,
  );

  const queryFilters = {
    studentId: selectedStudent?.id,
    schoolYearId: selectedSchoolYear?.id,
    schoolClassId: selectedSchoolClass?.id,
  };

  const {
    feeScheduleSummary,
    feeScheduleSummaryError,
    feeScheduleSummaryIsLoading,
    feeScheduleSummaryIsFetching,
    loadFeeScheduleSummary,
  } = useFeeScheduleSummary({
    filters: queryFilters,
    enabled: filtersAreComplete,
  });

  const {
    feeSchedules,
    feeSchedulesError,
    feeSchedulesIsLoading,
    feeSchedulesIsFetching,
    loadFeeSchedules,
  } = useFeeSchedules({
    filters: {
      ...queryFilters,
      status: filters.status,
      sortBy: filters.sortBy,
    },
    enabled: filtersAreComplete,
  });

  const activeFilterCount = useMemo(
    () => (filters.status.length > 0 ? 1 : 0) + (filters.sortBy ? 1 : 0),
    [filters],
  );

  const isRefreshing = feeScheduleSummaryIsFetching || feeSchedulesIsFetching;

  const handleRefresh = useCallback(() => {
    void loadFeeScheduleSummary();
    void loadFeeSchedules();
  }, [loadFeeScheduleSummary, loadFeeSchedules]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Frais",
        }}
      />

      <View className="flex-1 bg-gray-50">
        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher ses frais.
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
              <FeesFilterPanel
                value={filters}
                onApply={setFilters}
                onClose={() => setFiltersOpen(false)}
              />
            )}

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 24 }}
              refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
              }
            >
              <FeeScheduleSummaryCard
                summary={feeScheduleSummary}
                isLoading={feeScheduleSummaryIsLoading}
              />

              {feeScheduleSummaryError && (
                <View className="items-center justify-center px-6 py-4 gap-2">
                  <Text className="text-sm text-gray-500 text-center">
                    Impossible de charger le résumé des frais.
                  </Text>
                  <Pressable
                    onPress={() => loadFeeScheduleSummary()}
                    className="h-9 px-4 rounded-lg bg-black items-center justify-center"
                  >
                    <Text className="text-white text-sm font-medium">Réessayer</Text>
                  </Pressable>
                </View>
              )}

              <Text className="mx-4 mt-5 mb-1 text-xs font-semibold text-gray-400 uppercase">
                Échéances
              </Text>

              {feeSchedulesError ? (
                <View className="items-center justify-center px-6 py-10 gap-3">
                  <Text className="text-sm text-gray-500 text-center">
                    Impossible de charger les frais.
                  </Text>
                  <Pressable
                    onPress={() => loadFeeSchedules()}
                    className="h-10 px-4 rounded-lg bg-black items-center justify-center"
                  >
                    <Text className="text-white font-medium">Réessayer</Text>
                  </Pressable>
                </View>
              ) : feeSchedulesIsLoading ? (
                <View className="items-center justify-center py-16">
                  <ActivityIndicator />
                </View>
              ) : feeSchedules.length === 0 ? (
                <View className="items-center justify-center px-6 py-16">
                  <Text className="text-sm text-gray-400 text-center">
                    Aucune échéance de paiement de frais n&apos;est disponible pour
                    l&apos;élève.
                  </Text>
                </View>
              ) : (
                feeSchedules.map((schedule, index) => (
                  <FeeScheduleCard
                    key={schedule.feeInstallmentId ?? index}
                    schedule={schedule}
                  />
                ))
              )}
            </ScrollView>
          </>
        )}
      </View>
    </>
  );
}
