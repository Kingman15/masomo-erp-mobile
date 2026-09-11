import { FilterButton } from "@/components/list/filter-button";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useStudentIncidentSanctions } from "@/hooks/queries/items/student-incident-sanction";
import type { StudentIncidentSanction } from "@/utils/types/StudentIncidentSanction";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Stack, router, useNavigation } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SanctionFilterPanel } from "./sanction-filter-panel";
import {
  emptySanctionFilters,
  type SanctionFiltersForm,
} from "./sanction-filters";
import { SanctionRow } from "./sanction-row";

export function SanctionsScreen() {
  const navigation = useNavigation();
  const [filters, setFilters] = useState<SanctionFiltersForm>(
    emptySanctionFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const renderSanction = useCallback(
    ({ item }: { item: StudentIncidentSanction }) => (
      <SanctionRow
        sanction={item}
        onPress={(sanction) => router.push(`/teacher/sanctions/${sanction.id}`)}
      />
    ),
    [],
  );

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== null).length,
    [filters],
  );

  const { currentSchoolYear } = useCurrentSchoolYear();

  // Le backend exige schoolYearId : tant que l'utilisateur n'a rien choisi
  // explicitement via le panneau de filtres, on utilise l'année courante.
  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      schoolYearId: filters.schoolYearId ?? currentSchoolYear?.id ?? null,
    }),
    [filters, currentSchoolYear],
  );

  const {
    studentIncidentSanctions,
    studentIncidentSanctionsMeta,
    studentIncidentSanctionsError,
    studentIncidentSanctionsIsLoading,
    studentIncidentSanctionsIsFetchingNextPage,
    studentIncidentSanctionsIsRefetching,
    studentIncidentSanctionsHasNextPage,
    fetchNextStudentIncidentSanctions,
    loadStudentIncidentSanctions,
  } = useStudentIncidentSanctions({ filters: effectiveFilters });

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sanctions",
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.dispatch({ type: "OPEN_DRAWER" })}
              hitSlop={8}
            >
              <Ionicons name="menu-outline" size={24} color="#000000" />
            </Pressable>
          ),
        }}
      />

      <View className="flex-1 bg-white">
        <View className="flex-row items-center gap-3 px-4 pt-3 pb-2">
          <FilterButton
            fullWidth
            activeCount={activeFilterCount}
            onPress={() => setFiltersOpen((open) => !open)}
          />
        </View>

        {filtersOpen && (
          <SanctionFilterPanel
            value={filters}
            onApply={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        {studentIncidentSanctionsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : studentIncidentSanctionsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les sanctions.
            </Text>
            <Pressable
              onPress={() => loadStudentIncidentSanctions()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={studentIncidentSanctions}
            keyExtractor={(item) => item.id}
            renderItem={renderSanction}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              studentIncidentSanctionsMeta ? (
                <Text className="px-4 py-2 text-xs text-gray-400">
                  {studentIncidentSanctionsMeta.total} sanction
                  {studentIncidentSanctionsMeta.total > 1 ? "s" : ""}
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucune sanction ne correspond aux filtres.
                </Text>
              </View>
            }
            ListFooterComponent={
              studentIncidentSanctionsIsFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator />
                </View>
              ) : null
            }
            onEndReached={() => {
              if (
                studentIncidentSanctionsHasNextPage &&
                !studentIncidentSanctionsIsFetchingNextPage
              ) {
                fetchNextStudentIncidentSanctions();
              }
            }}
            onEndReachedThreshold={0.4}
            refreshing={studentIncidentSanctionsIsRefetching}
            onRefresh={loadStudentIncidentSanctions}
          />
        )}
      </View>
    </>
  );
}
