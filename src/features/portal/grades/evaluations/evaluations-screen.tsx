import { FilterButton } from "@/components/list/filter-button";
import { Stack, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { EvaluationFilterPanel } from "./evaluation-filter-panel";
import {
  emptyEvaluationFilters,
  type EvaluationFiltersForm,
} from "./evaluation-filters";
import { EvaluationTypeGroup } from "./evaluation-type-group";
import { usePortalSelection } from "../../use-portal-selection";
import { PortalTeachingCourseEvaluationDTO } from "@/utils/types/objects/PortalTeachingCourseEvaluationDTO";
import { usePortalTeachingCourseEvaluations } from "@/hooks/queries/items/teaching-course-evaluation";

export function EvaluationsScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const [filters, setFilters] = useState<EvaluationFiltersForm>(
    emptyEvaluationFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handlePressEvaluation = useCallback(
    (evaluation: PortalTeachingCourseEvaluationDTO) => {
      router.push(`/portal/menu/grades/evaluations/${evaluation.id}`);
    },
    [],
  );

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
    portalTeachingCourseEvaluations = [],
    portalTeachingCourseEvaluationsError,
    portalTeachingCourseEvaluationsIsLoading,
    portalTeachingCourseEvaluationsIsFetching,
    loadPortalTeachingCourseEvaluations,
  } = usePortalTeachingCourseEvaluations({
    studentId: selectedStudent?.id,
    filters: effectiveFilters,
    enabled: filtersAreComplete,
  });

  const evaluationTypeOptions = useMemo(() => {
    const types = new Set<string>();
    for (const evaluation of portalTeachingCourseEvaluations) {
      if (evaluation.evaluationType) types.add(evaluation.evaluationType);
    }
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [portalTeachingCourseEvaluations]);

  const groupedEvaluations = useMemo(() => {
    const filtered = filters.evaluationType
      ? portalTeachingCourseEvaluations.filter(
          (evaluation) => evaluation.evaluationType === filters.evaluationType,
        )
      : portalTeachingCourseEvaluations;

    const groups = new Map<string, PortalTeachingCourseEvaluationDTO[]>();
    for (const evaluation of filtered) {
      const key = evaluation.evaluationType ?? "Autre";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(evaluation);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => {
        if (a === "Autre") return 1;
        if (b === "Autre") return -1;
        return a.localeCompare(b);
      })
      .map(([type, evaluations]) => ({ type, evaluations }));
  }, [portalTeachingCourseEvaluations, filters.evaluationType]);

  const filteredEvaluationsCount = useMemo(
    () => groupedEvaluations.reduce((sum, group) => sum + group.evaluations.length, 0),
    [groupedEvaluations],
  );

  useEffect(() => {
    if (portalTeachingCourseEvaluationsError) {
      console.error(
        "[portal-evaluations] Erreur de chargement",
        portalTeachingCourseEvaluationsError,
      );
    }
  }, [portalTeachingCourseEvaluationsError]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Évaluations",
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
          <EvaluationFilterPanel
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
              Sélectionnez un élève pour afficher ses évaluations.
            </Text>
          </View>
        ) : portalTeachingCourseEvaluationsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalTeachingCourseEvaluationsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les évaluations.
            </Text>
            <Pressable
              onPress={() => loadPortalTeachingCourseEvaluations()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : groupedEvaluations.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 py-16">
            <Text className="text-sm text-gray-400 text-center">
              Aucune évaluation disponible pour cet élève.
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={portalTeachingCourseEvaluationsIsFetching}
                onRefresh={loadPortalTeachingCourseEvaluations}
              />
            }
          >
            <Text className="px-4 py-2 text-xs text-gray-400">
              {filteredEvaluationsCount} évaluation
              {filteredEvaluationsCount > 1 ? "s" : ""}
            </Text>

            {groupedEvaluations.map((group) => (
              <EvaluationTypeGroup
                key={group.type}
                type={group.type}
                evaluations={group.evaluations}
                onPressEvaluation={handlePressEvaluation}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
}
