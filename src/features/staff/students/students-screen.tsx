import { ComboBox } from "@/components/list/combo-box";
import { SearchBar } from "@/components/list/search-bar";
import { DrawerMenuButton } from "@/features/staff/drawer-menu-button";
import { useEnrollmentPages } from "@/hooks/queries/items/enrollment";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import type { Enrollment } from "@/utils/types/Enrollment";
import { FlashList } from "@shopify/flash-list";
import { router, Stack } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { getSchoolClassLabel } from "../attendance/attendance-labels";
import { EnrollmentRow } from "./enrollment-row";

// Élèves inscrits sur l'année courante (consultation) ; avec une classe choisie, le total donne son effectif.
export function StudentsScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [schoolClassId, setSchoolClassId] = useState<string | null>(null);

  const { currentSchoolYear } = useCurrentSchoolYear();
  const schoolYearId = currentSchoolYear?.id ?? null;

  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: { schoolYearId },
    enabled: Boolean(schoolYearId),
  });

  const {
    enrollments,
    enrollmentsMeta,
    enrollmentsError,
    enrollmentsIsLoading,
    enrollmentsIsFetchingNextPage,
    enrollmentsIsRefetching,
    enrollmentsHasNextPage,
    fetchNextEnrollments,
    loadEnrollments,
  } = useEnrollmentPages({ filters: { schoolYearId, schoolClassId, searchTerm } });

  const renderEnrollment = useCallback(
    ({ item }: { item: Enrollment }) => (
      <EnrollmentRow
        enrollment={item}
        onPress={(enrollment) => router.push(`/staff/students/${enrollment.id}`)}
      />
    ),
    [],
  );

  const total = enrollmentsMeta?.total ?? 0;

  return (
    <>
      <Stack.Screen
        options={{ title: "Élèves", headerLeft: () => <DrawerMenuButton /> }}
      />

      <View className="flex-1 bg-background">
        <View className="px-4 pt-3">
          <SearchBar placeholder="Rechercher un élève" onChangeText={setSearchTerm} />
          <View className="mt-3">
            <ComboBox
              label="Classe"
              placeholder="Toutes les classes"
              options={(schoolClasses ?? []).map((schoolClass) => ({
                id: schoolClass.id,
                label: getSchoolClassLabel(schoolClass),
              }))}
              value={schoolClassId}
              onChange={setSchoolClassId}
              loading={schoolClassesIsLoading}
            />
          </View>
        </View>

        {enrollmentsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : enrollmentsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger les élèves.
            </Text>
            <Pressable
              onPress={() => loadEnrollments()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={enrollments}
            keyExtractor={(item) => item.id}
            renderItem={renderEnrollment}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              enrollmentsMeta ? (
                <Text className="px-4 py-2 text-xs text-faint">
                  {total} élève{total > 1 ? "s" : ""}
                  {schoolClassId ? " dans la classe" : " inscrit" + (total > 1 ? "s" : "")}
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-faint text-center">
                  Aucun élève ne correspond à la recherche.
                </Text>
              </View>
            }
            ListFooterComponent={
              enrollmentsIsFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator />
                </View>
              ) : null
            }
            onEndReached={() => {
              if (enrollmentsHasNextPage && !enrollmentsIsFetchingNextPage) {
                fetchNextEnrollments();
              }
            }}
            onEndReachedThreshold={0.4}
            refreshing={enrollmentsIsRefetching}
            onRefresh={loadEnrollments}
          />
        )}
      </View>
    </>
  );
}
