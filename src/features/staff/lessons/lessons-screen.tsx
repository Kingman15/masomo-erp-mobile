import { FilterButton } from "@/components/list/filter-button";
import { SearchBar } from "@/components/list/search-bar";
import { DrawerMenuButton } from "@/features/staff/drawer-menu-button";
import { useLessons } from "@/hooks/queries/items/lesson";
import { useCan } from "@/hooks/use-can";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useOfflineQueue } from "@/lib/offline/use-offline-queue";
import type { Lesson } from "@/utils/types/Lesson";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Stack, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { LessonFilterPanel } from "./lesson-filter-panel";
import { emptyLessonFilters, type LessonFiltersForm } from "./lesson-filters";
import { LessonRow } from "./lesson-row";
import { PendingLessonRow } from "./pending-lesson-row";

export function LessonsScreen() {
  const colors = useThemeColors();
  const canCreate = useCan("academics.lessons.create");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<LessonFiltersForm>(emptyLessonFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const renderLesson = useCallback(
    ({ item }: { item: Lesson }) => (
      <LessonRow
        lesson={item}
        onPress={(lesson) => router.push(`/staff/lessons/${lesson.id}`)}
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

  // Les refus restent dans l'écran Synchronisation.
  const pendingLessons = useOfflineQueue().filter(
    (item) => item.name === "lesson.create" && item.state !== "failed",
  );

  useEffect(() => {
    if (lessonsError) {
      console.error("[lessons] Erreur de chargement", lessonsError);
    }
  }, [lessonsError]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Leçons",
          headerLeft: () => <DrawerMenuButton />,
          headerRight: canCreate
            ? () => (
                <Pressable
                  onPress={() => router.push("/staff/lessons/new")}
                  hitSlop={8}
                >
                  <Ionicons
                    name="add-outline"
                    size={26}
                    color={colors.foreground}
                  />
                </Pressable>
              )
            : undefined,
        }}
      />

      <View className="flex-1 bg-background">
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
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger les leçons.
            </Text>
            <Pressable
              onPress={() => loadLessons()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={lessons}
            keyExtractor={(item) => item.id}
            renderItem={renderLesson}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              <>
                {pendingLessons.map((item) => (
                  <PendingLessonRow key={item.mutationId} item={item} />
                ))}
                {lessonsMeta ? (
                  <Text className="px-4 py-2 text-xs text-faint">
                    {lessonsMeta.total} leçon{lessonsMeta.total > 1 ? "s" : ""}
                  </Text>
                ) : null}
              </>
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-faint text-center">
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
