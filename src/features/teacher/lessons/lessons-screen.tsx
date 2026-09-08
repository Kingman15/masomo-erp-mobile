import { FilterButton } from "@/components/list/filter-button";
import { SearchBar } from "@/components/list/search-bar";
import { useLessons } from "@/hooks/queries/items/lesson";
import type { Lesson } from "@/utils/types/Lesson";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Stack, router, useNavigation } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { LessonFilterPanel } from "./lesson-filter-panel";
import { emptyLessonFilters, type LessonFiltersForm } from "./lesson-filters";
import { LessonRow } from "./lesson-row";

export function LessonsScreen() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<LessonFiltersForm>(emptyLessonFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const renderLesson = useCallback(
    ({ item }: { item: Lesson }) => (
      <LessonRow
        lesson={item}
        onPress={(lesson) => router.push(`/teacher/lessons/${lesson.id}`)}
      />
    ),
    [],
  );

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== null).length,
    [filters],
  );

  const {
    lessons,
    lessonsMeta,
    lessonsError,
    lessonsIsLoading,
    lessonsIsFetchingNextPage,
    lessonsIsRefetching,
    lessonsHasNextPage,
    fetchNextLessons,
    loadLessons,
  } = useLessons({
    filters: { ...filters, searchTerm },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: "Leçons",
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
              onPress={() => router.push("/teacher/lessons/new")}
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
              placeholder="Rechercher une leçon"
              onChangeText={setSearchTerm}
            />
          </View>
          <FilterButton
            activeCount={activeFilterCount}
            onPress={() => setFiltersOpen((open) => !open)}
          />
        </View>

        {filtersOpen && (
          <LessonFilterPanel
            value={filters}
            onApply={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        {lessonsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : lessonsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les leçons.
            </Text>
            <Pressable
              onPress={() => loadLessons()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={lessons}
            keyExtractor={(item) => item.id}
            renderItem={renderLesson}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              lessonsMeta ? (
                <Text className="px-4 py-2 text-xs text-gray-400">
                  {lessonsMeta.total} leçon{lessonsMeta.total > 1 ? "s" : ""}
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucune leçon ne correspond à ta recherche.
                </Text>
              </View>
            }
            ListFooterComponent={
              lessonsIsFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator />
                </View>
              ) : null
            }
            onEndReached={() => {
              if (lessonsHasNextPage && !lessonsIsFetchingNextPage) {
                fetchNextLessons();
              }
            }}
            onEndReachedThreshold={0.4}
            refreshing={lessonsIsRefetching}
            onRefresh={loadLessons}
          />
        )}
      </View>
    </>
  );
}
