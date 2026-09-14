import { FilterButton } from "@/components/list/filter-button";
import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useTeachingCourseEvaluations } from "@/hooks/queries/items/teaching-course-evaluation";
import type { TeachingCourseEvaluation } from "@/utils/types/TeachingCourseEvaluation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Stack, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { EvaluationFilterPanel } from "./evaluation-filter-panel";
import {
  emptyEvaluationFilters,
  type EvaluationFiltersForm,
} from "./evaluation-filters";
import { EvaluationRow } from "./evaluation-row";

export function EvaluationsScreen() {
  const [filters, setFilters] = useState<EvaluationFiltersForm>(
    emptyEvaluationFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const renderEvaluation = useCallback(
    ({ item }: { item: TeachingCourseEvaluation }) => (
      <EvaluationRow
        evaluation={item}
        onPress={() =>
          router.push(`/teacher/evaluations/${item.id}/edit`)
        }
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
    teachingCourseEvaluations,
    teachingCourseEvaluationsMeta,
    teachingCourseEvaluationsError,
    teachingCourseEvaluationsIsLoading,
    teachingCourseEvaluationsIsFetchingNextPage,
    teachingCourseEvaluationsIsRefetching,
    teachingCourseEvaluationsHasNextPage,
    fetchNextTeachingCourseEvaluations,
    loadTeachingCourseEvaluations,
  } = useTeachingCourseEvaluations({ filters: effectiveFilters });

  useEffect(() => {
    if (teachingCourseEvaluationsError) {
      console.error(
        "[evaluations] Erreur de chargement",
        teachingCourseEvaluationsError,
      );
    }
  }, [teachingCourseEvaluationsError]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Évaluations",
          headerLeft: () => <DrawerMenuButton />,
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/teacher/evaluations/new")}
              hitSlop={8}
            >
              <Ionicons name="add-outline" size={26} color="#000000" />
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
          <EvaluationFilterPanel
            value={filters}
            onApply={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        {teachingCourseEvaluationsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : teachingCourseEvaluationsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les évaluations.
            </Text>
            <Pressable
              onPress={() => loadTeachingCourseEvaluations()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={teachingCourseEvaluations}
            keyExtractor={(item) => item.id}
            renderItem={renderEvaluation}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              teachingCourseEvaluationsMeta ? (
                <Text className="px-4 py-2 text-xs text-gray-400">
                  {teachingCourseEvaluationsMeta.total} évaluation
                  {teachingCourseEvaluationsMeta.total > 1 ? "s" : ""}
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucune évaluation ne correspond à ta recherche.
                </Text>
              </View>
            }
            ListFooterComponent={
              teachingCourseEvaluationsIsFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator />
                </View>
              ) : null
            }
            onEndReached={() => {
              if (
                teachingCourseEvaluationsHasNextPage &&
                !teachingCourseEvaluationsIsFetchingNextPage
              ) {
                fetchNextTeachingCourseEvaluations();
              }
            }}
            onEndReachedThreshold={0.4}
            refreshing={teachingCourseEvaluationsIsRefetching}
            onRefresh={loadTeachingCourseEvaluations}
          />
        )}
      </View>
    </>
  );
}
