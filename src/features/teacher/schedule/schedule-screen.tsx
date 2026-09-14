import { FilterButton } from "@/components/list/filter-button";
import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { useActiveCourseSchedule } from "@/hooks/queries/items/course-schedule";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useTeachingScheduleDTOs } from "@/hooks/queries/items/teaching-schedule";
import Ionicons from "@expo/vector-icons/Ionicons";
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
import { flattenTeachingScheduleDTOs } from "./schedule-days";
import { ScheduleFilterPanel } from "./schedule-filter-panel";
import { ScheduleRow } from "./schedule-row";
import {
  emptyScheduleFilters,
  type ScheduleFiltersForm,
} from "./schedule-filters";

export function ScheduleScreen() {

  const [filters, setFilters] = useState<ScheduleFiltersForm>(
    emptyScheduleFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { currentSchoolYear } = useCurrentSchoolYear();
  const effectiveSchoolYearId =
    filters.schoolYearId ?? currentSchoolYear?.id ?? null;

  const {
    activeCourseSchedule,
    activeCourseScheduleError,
    activeCourseScheduleIsLoading,
    loadActiveCourseSchedule,
  } = useActiveCourseSchedule({ schoolYearId: effectiveSchoolYearId });

  const {
    teachingScheduleDTOs,
    teachingScheduleDTOsError,
    teachingScheduleDTOsIsLoading,
    teachingScheduleDTOsIsFetching,
    loadTeachingScheduleDTOs,
  } = useTeachingScheduleDTOs({
    filters: {
      courseScheduleId: activeCourseSchedule?.id ?? null,
      schoolClassId: filters.schoolClassId,
      courseId: filters.courseId,
    },
  });

  const dayGroups = useMemo(
    () => flattenTeachingScheduleDTOs(teachingScheduleDTOs ?? []),
    [teachingScheduleDTOs],
  );

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== null).length,
    [filters],
  );

  const isLoading = activeCourseScheduleIsLoading || teachingScheduleDTOsIsLoading;
  const error = activeCourseScheduleError || teachingScheduleDTOsError;
  const isRefreshing = teachingScheduleDTOsIsFetching && !teachingScheduleDTOsIsLoading;

  const handleRefresh = useCallback(() => {
    void loadActiveCourseSchedule();
    void loadTeachingScheduleDTOs();
  }, [loadActiveCourseSchedule, loadTeachingScheduleDTOs]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Horaire",
          headerLeft: () => <DrawerMenuButton />,
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
          <ScheduleFilterPanel
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
          {isLoading ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator />
            </View>
          ) : error ? (
            <View className="items-center justify-center px-6 py-10 gap-3">
              <Text className="text-sm text-gray-500 text-center">
                Impossible de charger l&apos;horaire.
              </Text>
              <Pressable
                onPress={handleRefresh}
                className="h-10 px-4 rounded-lg bg-black items-center justify-center"
              >
                <Text className="text-white font-medium">Réessayer</Text>
              </Pressable>
            </View>
          ) : !activeCourseSchedule ? (
            <View className="items-center justify-center px-6 py-16">
              <Text className="text-sm text-gray-400 text-center">
                Aucun horaire configuré pour cette année scolaire.
              </Text>
            </View>
          ) : dayGroups.length === 0 ? (
            <View className="items-center justify-center px-6 py-16">
              <Text className="text-sm text-gray-400 text-center">
                Aucun cours prévu.
              </Text>
            </View>
          ) : (
            dayGroups.map((group) => (
              <View key={group.day}>
                <Text className="px-4 pt-5 pb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {group.label}
                </Text>
                {group.rows.map((row, index) => (
                  <ScheduleRow key={row.id} item={row} isFirst={index === 0} />
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}
