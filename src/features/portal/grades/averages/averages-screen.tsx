import { FilterButton } from "@/components/list/filter-button";
import { usePortalCourseAverages } from "@/hooks/queries/items/course-average";
import { CourseAverageDTO } from "@/utils/types/objects/CourseAverageDTO";
import { FlashList } from "@shopify/flash-list";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { CourseAverageFilterPanel } from "./course-average-filter-panel";
import {
  emptyCourseAverageFilters,
  type CourseAverageFiltersForm,
} from "./course-average-filters";
import { CourseAverageRow } from "./course-average-row";

export function AveragesScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const [filters, setFilters] = useState<CourseAverageFiltersForm>(
    emptyCourseAverageFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== null).length,
    [filters],
  );

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && selectedSchoolClass?.id,
  );

  const {
    portalCourseAverages = [],
    portalCourseAveragesError,
    portalCourseAveragesIsLoading,
    portalCourseAveragesIsFetching,
    loadPortalCourseAverages,
  } = usePortalCourseAverages({
    studentId: selectedStudent?.id,
    filters: {
      schoolYearId: selectedSchoolYear?.id,
      schoolClassId: selectedSchoolClass?.id,
      evaluationPeriodId: filters.evaluationPeriodId,
      sysyId: filters.sysyId,
    },
    enabled: filtersAreComplete,
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Moyennes",
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

        {filtersOpen && selectedSchoolYear?.id && (
          <CourseAverageFilterPanel
            schoolYearId={selectedSchoolYear.id}
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
              Sélectionnez un élève pour afficher ses moyennes.
            </Text>
          </View>
        ) : portalCourseAveragesIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalCourseAveragesError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les moyennes.
            </Text>
            <Pressable
              onPress={() => loadPortalCourseAverages()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList<CourseAverageDTO>
            data={portalCourseAverages}
            keyExtractor={(item) => item.followCourseId}
            renderItem={({ item }) => (
              <CourseAverageRow courseAverage={item} />
            )}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 12,
            }}
            ListHeaderComponent={
              <Text className="px-1 py-2 text-xs text-gray-400">
                {portalCourseAverages.length} moyenne
                {portalCourseAverages.length > 1 ? "s" : ""}
              </Text>
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucune moyenne disponible pour cet élève.
                </Text>
              </View>
            }
            refreshing={portalCourseAveragesIsFetching}
            onRefresh={loadPortalCourseAverages}
          />
        )}
      </View>
    </>
  );
}
