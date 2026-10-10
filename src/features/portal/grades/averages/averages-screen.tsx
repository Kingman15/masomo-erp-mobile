import { FilterButton } from "@/components/list/filter-button";
import {
  RequiredFiltersNotice,
  type RequiredFilter,
} from "@/components/list/required-filters-notice";
import { usePortalCourseAverages } from "@/hooks/queries/items/course-average";
import { CourseAverageDTO } from "@/utils/types/objects/CourseAverageDTO";
import { FlashList } from "@shopify/flash-list";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { StudentSwitcherEntry } from "../../student-switcher-entry";
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

  const requirements: RequiredFilter[] = [
    { label: "un élève", done: Boolean(selectedStudent?.id) },
    { label: "une année scolaire", done: Boolean(selectedSchoolYear?.id) },
    { label: "une classe", done: Boolean(selectedSchoolClass?.id) },
  ];
  const filtersAreComplete = requirements.every((requirement) => requirement.done);

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
      schoolPeriodId: filters.schoolPeriodId,
      schoolYearTermId: filters.schoolYearTermId,
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

      <View className="flex-1 bg-background">
        {/* Élève · Année · Classe : rappel du contexte, touchable pour le changer sans repasser par le Menu. */}
        <View className="px-4 pt-3 -mb-2">
          <StudentSwitcherEntry />
        </View>

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
          <RequiredFiltersNotice title="Aucune moyenne" requirements={requirements} />
        ) : portalCourseAveragesIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalCourseAveragesError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger les moyennes.
            </Text>
            <Pressable
              onPress={() => loadPortalCourseAverages()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
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
              <Text className="px-1 py-2 text-xs text-faint">
                {portalCourseAverages.length} moyenne
                {portalCourseAverages.length > 1 ? "s" : ""}
              </Text>
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-faint text-center">
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
