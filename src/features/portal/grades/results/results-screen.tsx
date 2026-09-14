import { FilterButton } from "@/components/list/filter-button";
import { usePortalGrades } from "@/hooks/queries/items/grade";
import { PortalGradeDTO } from "@/utils/types/objects/PortalGradeDTO";
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
import { GradeFilterPanel } from "./grade-filter-panel";
import { emptyGradeFilters, type GradeFiltersForm } from "./grade-filters";
import { GradeTypeGroup } from "./grade-type-group";

export function ResultsScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const [filters, setFilters] = useState<GradeFiltersForm>(emptyGradeFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== null).length,
    [filters],
  );

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && selectedSchoolClass?.id,
  );

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      schoolYearId: selectedSchoolYear?.id ?? null,
      schoolClassId: selectedSchoolClass?.id ?? null,
    }),
    [filters, selectedSchoolYear, selectedSchoolClass],
  );

  const {
    portalGrades = [],
    portalGradesError,
    portalGradesIsLoading,
    portalGradesIsFetching,
    loadPortalGrades,
  } = usePortalGrades({
    studentId: selectedStudent?.id,
    filters: effectiveFilters,
    enabled: filtersAreComplete,
  });

  const evaluationTypeOptions = useMemo(() => {
    const types = new Set<string>();
    for (const grade of portalGrades) {
      if (grade.evaluationType) types.add(grade.evaluationType);
    }
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [portalGrades]);

  const groupedGrades = useMemo(() => {
    const filtered = filters.evaluationType
      ? portalGrades.filter(
          (grade) => grade.evaluationType === filters.evaluationType,
        )
      : portalGrades;

    const groups = new Map<string, PortalGradeDTO[]>();
    for (const grade of filtered) {
      const key = grade.evaluationType ?? "Autre";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(grade);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => {
        if (a === "Autre") return 1;
        if (b === "Autre") return -1;
        return a.localeCompare(b);
      })
      .map(([type, grades]) => ({ type, grades }));
  }, [portalGrades, filters.evaluationType]);

  const filteredGradesCount = useMemo(
    () => groupedGrades.reduce((sum, group) => sum + group.grades.length, 0),
    [groupedGrades],
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Résultats",
        }}
      />

      <View className="flex-1 bg-white">
        {filtersAreComplete && (
          <View className="flex-row items-center gap-3 px-4 pt-3 pb-2">
            <FilterButton
              fullWidth
              activeCount={activeFilterCount}
              onPress={() => setFiltersOpen((open) => !open)}
            />
          </View>
        )}

        {filtersOpen && selectedSchoolYear?.id && selectedSchoolClass?.id && (
          <GradeFilterPanel
            schoolYearId={selectedSchoolYear.id}
            schoolClassId={selectedSchoolClass.id}
            evaluationTypeOptions={evaluationTypeOptions}
            value={filters}
            onApply={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher ses résultats.
            </Text>
          </View>
        ) : portalGradesIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalGradesError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les résultats.
            </Text>
            <Pressable
              onPress={() => loadPortalGrades()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : groupedGrades.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 py-16">
            <Text className="text-sm text-gray-400 text-center">
              Aucun résultat disponible pour cet élève.
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={portalGradesIsFetching}
                onRefresh={loadPortalGrades}
              />
            }
          >
            <Text className="px-4 py-2 text-xs text-gray-400">
              {filteredGradesCount} résultat
              {filteredGradesCount > 1 ? "s" : ""}
            </Text>

            {groupedGrades.map((group) => (
              <GradeTypeGroup
                key={group.type}
                type={group.type}
                grades={group.grades}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
}
