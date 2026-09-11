import { FilterButton } from "@/components/list/filter-button";
import { SearchBar } from "@/components/list/search-bar";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useStudentIncidents } from "@/hooks/queries/items/student-incident";
import type { StudentIncident } from "@/utils/types/StudentIncident";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Stack, router, useNavigation } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { IncidentFilterPanel } from "./incident-filter-panel";
import {
  emptyIncidentFilters,
  type IncidentFiltersForm,
} from "./incident-filters";
import { IncidentRow } from "./incident-row";

export function IncidentsScreen() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<IncidentFiltersForm>(
    emptyIncidentFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const renderIncident = useCallback(
    ({ item }: { item: StudentIncident }) => (
      <IncidentRow
        incident={item}
        onPress={(incident) => router.push(`/teacher/incidents/${incident.id}`)}
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
      searchTerm,
    }),
    [filters, currentSchoolYear, searchTerm],
  );

  const {
    studentIncidents,
    studentIncidentsMeta,
    studentIncidentsError,
    studentIncidentsIsLoading,
    studentIncidentsIsFetchingNextPage,
    studentIncidentsIsRefetching,
    studentIncidentsHasNextPage,
    fetchNextStudentIncidents,
    loadStudentIncidents,
  } = useStudentIncidents({ filters: effectiveFilters });

  return (
    <>
      <Stack.Screen
        options={{
          title: "Incidents",
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.dispatch({ type: "OPEN_DRAWER" })}
              hitSlop={8}
            >
              <Ionicons name="menu-outline" size={24} color="#000000" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/teacher/incidents/new")}
              hitSlop={8}
            >
              <Ionicons name="add-outline" size={26} color="#000000" />
            </Pressable>
          ),
        }}
      />

      <View className="flex-1 bg-white">
        <View className="flex-row items-center gap-3 px-4 pt-3 pb-2">
          <View className="flex-1">
            <SearchBar
              placeholder="Rechercher un incident"
              onChangeText={setSearchTerm}
            />
          </View>
          <FilterButton
            activeCount={activeFilterCount}
            onPress={() => setFiltersOpen((open) => !open)}
          />
        </View>

        {filtersOpen && (
          <IncidentFilterPanel
            value={filters}
            onApply={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        {studentIncidentsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : studentIncidentsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les incidents.
            </Text>
            <Pressable
              onPress={() => loadStudentIncidents()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={studentIncidents}
            keyExtractor={(item) => item.id}
            renderItem={renderIncident}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              studentIncidentsMeta ? (
                <Text className="px-4 py-2 text-xs text-gray-400">
                  {studentIncidentsMeta.total} incident
                  {studentIncidentsMeta.total > 1 ? "s" : ""}
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucun incident ne correspond aux filtres.
                </Text>
              </View>
            }
            ListFooterComponent={
              studentIncidentsIsFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator />
                </View>
              ) : null
            }
            onEndReached={() => {
              if (
                studentIncidentsHasNextPage &&
                !studentIncidentsIsFetchingNextPage
              ) {
                fetchNextStudentIncidents();
              }
            }}
            onEndReachedThreshold={0.4}
            refreshing={studentIncidentsIsRefetching}
            onRefresh={loadStudentIncidents}
          />
        )}
      </View>
    </>
  );
}
