import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { useTeachingCourses } from "@/hooks/queries/items/teaching-course";
import type { TeachingCourse } from "@/utils/types/TeachingCourse";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Stack, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { TeachingCourseFilterPanel } from "./teaching-course-filter-panel";
import {
  emptyTeachingCourseFilters,
  type TeachingCourseFiltersForm,
} from "./teaching-course-filters";
import { TeachingCourseRow } from "./teaching-course-row";

export function TeachingCoursesScreen() {
  const [filters, setFilters] = useState<TeachingCourseFiltersForm>(
    emptyTeachingCourseFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const renderTeachingCourse = useCallback(
    ({ item }: { item: TeachingCourse }) => (
      <TeachingCourseRow
        teachingCourse={item}
        onPress={(teachingCourse) =>
          router.push(`/teacher/teaching-courses/${teachingCourse.id}`)
        }
      />
    ),
    [],
  );

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== null).length,
    [filters],
  );

  const {
    teachingCourses,
    teachingCoursesError,
    teachingCoursesIsLoading,
    teachingCoursesIsFetching,
    loadTeachingCourses,
  } = useTeachingCourses({ filters });

  return (
    <>
      <Stack.Screen
        options={{
          title: "Cours",
          headerLeft: () => <DrawerMenuButton />,
        }}
      />

      <View className="flex-1 bg-white">
        <View className="px-4 pt-3 pb-2">
          <Pressable
            onPress={() => setFiltersOpen((open) => !open)}
            className={`flex-row items-center justify-center gap-2 h-11 rounded-lg ${
              activeFilterCount > 0 ? "bg-black" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={activeFilterCount > 0 ? "#FFFFFF" : "#374151"}
            />
            <Text
              className={`text-sm font-medium ${
                activeFilterCount > 0 ? "text-white" : "text-gray-700"
              }`}
            >
              Filtrer les cours
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Text>
          </Pressable>
        </View>

        {filtersOpen && (
          <TeachingCourseFilterPanel
            value={filters}
            onApply={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        {teachingCoursesIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : teachingCoursesError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les cours.
            </Text>
            <Pressable
              onPress={() => loadTeachingCourses()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={teachingCourses ?? []}
            keyExtractor={(item) => item.id}
            renderItem={renderTeachingCourse}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              teachingCourses ? (
                <Text className="px-4 py-2 text-xs text-gray-400">
                  {teachingCourses.length} cours
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucun cours pour ces filtres.
                </Text>
              </View>
            }
            refreshing={teachingCoursesIsFetching}
            onRefresh={loadTeachingCourses}
          />
        )}
      </View>
    </>
  );
}
