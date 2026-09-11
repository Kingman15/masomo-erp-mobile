import { FilterButton } from "@/components/list/filter-button";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useStudentInternalRegulations } from "@/hooks/queries/items/student-internal-regulation";
import { useStudentRegulationArticles } from "@/hooks/queries/items/student-regulation-article";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ArticleAccordionItem } from "./article-accordion-item";
import { InternalRegulationFilterPanel } from "./internal-regulation-filter-panel";
import {
  emptyInternalRegulationFilters,
  targetIdFromFilters,
  type InternalRegulationFiltersForm,
} from "./internal-regulation-filters";
import { RegulationMetaCard } from "./regulation-meta-card";

function countActiveFilters(filters: InternalRegulationFiltersForm): number {
  let count = 0;
  if (filters.schoolYearId) count += 1;
  if (filters.targetType !== "global") count += 1;
  if (filters.studentInternalRegulationId) count += 1;
  return count;
}

export function InternalRegulationsScreen() {
  const navigation = useNavigation();

  const [filters, setFilters] = useState<InternalRegulationFiltersForm>(
    emptyInternalRegulationFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { currentSchoolYear } = useCurrentSchoolYear();

  const effectiveSchoolYearId =
    filters.schoolYearId ?? currentSchoolYear?.id ?? null;
  const targetId = targetIdFromFilters(filters);

  const {
    studentInternalRegulations,
    studentInternalRegulationsError,
    studentInternalRegulationsIsLoading,
    studentInternalRegulationsIsFetching,
    loadStudentInternalRegulations,
  } = useStudentInternalRegulations({
    filters: {
      schoolYearId: effectiveSchoolYearId,
      targetType: filters.targetType,
      targetId,
    },
  });

  const {
    studentRegulationArticles,
    studentRegulationArticlesError,
    studentRegulationArticlesIsLoading,
    studentRegulationArticlesIsFetching,
    loadStudentRegulationArticles,
  } = useStudentRegulationArticles({
    filters: { regulationId: filters.studentInternalRegulationId },
  });

  // Sélectionne automatiquement le dernier règlement actif quand la liste charge.
  useEffect(() => {
    if (filters.studentInternalRegulationId) return;

    const activeRegulation = studentInternalRegulations
      .filter((regulation) => regulation.isActive)
      .sort((a, b) => b.id.localeCompare(a.id))[0];

    if (activeRegulation) {
      setFilters((prev) => ({
        ...prev,
        studentInternalRegulationId: activeRegulation.id,
      }));
    }
  }, [studentInternalRegulations, filters.studentInternalRegulationId]);

  const regulation = useMemo(
    () =>
      studentInternalRegulations.find(
        (item) => item.id === filters.studentInternalRegulationId,
      ) ?? null,
    [studentInternalRegulations, filters.studentInternalRegulationId],
  );

  const rootArticles = useMemo(
    () =>
      [...studentRegulationArticles].sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
      ),
    [studentRegulationArticles],
  );

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const isRefreshing =
    studentInternalRegulationsIsFetching || studentRegulationArticlesIsFetching;

  const handleRefresh = useCallback(() => {
    void loadStudentInternalRegulations();
    if (filters.studentInternalRegulationId) {
      void loadStudentRegulationArticles();
    }
  }, [
    loadStudentInternalRegulations,
    loadStudentRegulationArticles,
    filters.studentInternalRegulationId,
  ]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Règlement d'ordre intérieur",
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

      <View className="flex-1 bg-gray-50">
        <View className="flex-row items-center gap-3 px-4 pt-3 pb-2">
          <FilterButton
            fullWidth
            activeCount={activeFilterCount}
            onPress={() => setFiltersOpen((open) => !open)}
          />
        </View>

        {filtersOpen && (
          <InternalRegulationFilterPanel
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
          {studentInternalRegulationsError ? (
            <View className="items-center justify-center px-6 py-10 gap-3">
              <Text className="text-sm text-gray-500 text-center">
                Impossible de charger les règlements.
              </Text>
              <Pressable
                onPress={() => loadStudentInternalRegulations()}
                className="h-10 px-4 rounded-lg bg-black items-center justify-center"
              >
                <Text className="text-white font-medium">Réessayer</Text>
              </Pressable>
            </View>
          ) : studentInternalRegulationsIsLoading ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator />
            </View>
          ) : !filters.studentInternalRegulationId ? (
            <View className="items-center justify-center px-6 py-16">
              <Text className="text-sm text-gray-400 text-center">
                Sélectionnez un règlement pour le consulter.
              </Text>
            </View>
          ) : studentRegulationArticlesIsLoading ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator />
            </View>
          ) : studentRegulationArticlesError ? (
            <View className="items-center justify-center px-6 py-10 gap-3">
              <Text className="text-sm text-gray-500 text-center">
                Impossible de charger les articles de ce règlement.
              </Text>
              <Pressable
                onPress={() => loadStudentRegulationArticles()}
                className="h-10 px-4 rounded-lg bg-black items-center justify-center"
              >
                <Text className="text-white font-medium">Réessayer</Text>
              </Pressable>
            </View>
          ) : regulation ? (
            <>
              <RegulationMetaCard regulation={regulation} />

              <View className="mx-4 mt-4 rounded-xl border border-gray-200 bg-white overflow-hidden">
                {rootArticles.length === 0 ? (
                  <View className="items-center justify-center px-6 py-10">
                    <Text className="text-sm text-gray-400 text-center">
                      Ce règlement ne contient aucun article.
                    </Text>
                  </View>
                ) : (
                  rootArticles.map((article) => (
                    <ArticleAccordionItem key={article.id} article={article} />
                  ))
                )}
              </View>
            </>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
}
