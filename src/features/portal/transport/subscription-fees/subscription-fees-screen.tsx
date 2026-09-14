import { FilterButton } from "@/components/list/filter-button";
import { usePortalTransportSubscriptionFees } from "@/hooks/queries/items/portal-transport-subscription-fee";
import { Stack } from "expo-router";
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
import { SubscriptionFeeRow } from "./subscription-fee-row";
import {
  emptySubscriptionFeesFilters,
  type SubscriptionFeesFiltersForm,
} from "./subscription-fees-filters";
import { SubscriptionFeesFilterPanel } from "./subscription-fees-filter-panel";
import { SubscriptionFeesTotalsCard } from "./subscription-fees-totals-card";
import { SubscriptionPlansSummaryCard } from "./subscription-plans-summary-card";

export function SubscriptionFeesScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const [filters, setFilters] = useState<SubscriptionFeesFiltersForm>(
    emptySubscriptionFeesFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && selectedSchoolClass?.id,
  );

  const {
    portalTransportSubscriptionFees,
    portalTransportSubscriptionFeesError,
    portalTransportSubscriptionFeesIsLoading,
    portalTransportSubscriptionFeesIsFetching,
    loadPortalTransportSubscriptionFees,
  } = usePortalTransportSubscriptionFees({
    studentId: selectedStudent?.id,
    filters: {
      schoolYearId: selectedSchoolYear?.id,
      schoolClassId: selectedSchoolClass?.id,
      paymentStatus: filters.paymentStatus,
    },
    enabled: filtersAreComplete,
  });

  const activeFilterCount = useMemo(
    () => (filters.paymentStatus ? 1 : 0),
    [filters],
  );

  const subscription = portalTransportSubscriptionFees?.subscription ?? null;
  const fees = portalTransportSubscriptionFees?.fees ?? [];
  const currency = fees[0]?.currency ?? subscription?.plans[0]?.currency ?? undefined;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Frais d'abonnement",
        }}
      />

      <View className="flex-1 bg-gray-50">
        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher ses frais d&apos;abonnement.
            </Text>
          </View>
        ) : portalTransportSubscriptionFeesIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalTransportSubscriptionFeesError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les frais d&apos;abonnement.
            </Text>
            <Pressable
              onPress={() => loadPortalTransportSubscriptionFees()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : subscription === null ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Transport non souscrit
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Cet élève n&apos;est pas inscrit au transport scolaire.
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
              <SubscriptionFeesFilterPanel
                value={filters}
                onApply={setFilters}
                onClose={() => setFiltersOpen(false)}
              />
            )}

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 24 }}
              refreshControl={
                <RefreshControl
                  refreshing={portalTransportSubscriptionFeesIsFetching}
                  onRefresh={() => void loadPortalTransportSubscriptionFees()}
                />
              }
            >
              <SubscriptionPlansSummaryCard subscription={subscription} />

              <Text className="mx-4 mt-5 mb-1 text-xs font-semibold text-gray-400 uppercase">
                Échéances
              </Text>

              {fees.length === 0 ? (
                <View className="items-center justify-center px-6 py-10">
                  <Text className="text-sm text-gray-400 text-center">
                    Aucune échéance de frais d&apos;abonnement.
                  </Text>
                </View>
              ) : (
                fees.map((fee) => <SubscriptionFeeRow key={fee.id} fee={fee} />)
              )}

              <SubscriptionFeesTotalsCard
                totalFees={portalTransportSubscriptionFees?.meta.totalFees ?? 0}
                totalAmountNet={portalTransportSubscriptionFees?.meta.totalAmountNet ?? "0"}
                currency={currency}
              />
            </ScrollView>
          </>
        )}
      </View>
    </>
  );
}
