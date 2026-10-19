import { SearchBar } from "@/components/list/search-bar";
import { DrawerMenuButton } from "@/features/staff/drawer-menu-button";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { SchoolClass } from "@/utils/types/SchoolClass";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { getSchoolClassLabel } from "../attendance/attendance-labels";
import { getHomeroomTeachersLabel } from "./class-labels";

function ClassRow({ schoolClass }: { schoolClass: SchoolClass }) {
  const colors = useThemeColors();
  const details = [
    schoolClass.generalClass?.title,
    getHomeroomTeachersLabel(schoolClass) || null,
    schoolClass.classroom?.designation,
  ].filter(Boolean);

  return (
    <Pressable
      onPress={() => router.push(`/staff/classes/${schoolClass.id}`)}
      className="flex-row items-center gap-3 px-4 py-3 border-b border-divider bg-card active:bg-subtle"
    >
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {getSchoolClassLabel(schoolClass)}
        </Text>
        {details.length > 0 && (
          <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={2}>
            {details.join(" · ")}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

// Classes de l'année courante (consultation), comme l'entrée « Classes » du web : l'API limite un enseignant à ses classes.
export function ClassesScreen() {
  const [searchTerm, setSearchTerm] = useState("");

  const { currentSchoolYear } = useCurrentSchoolYear();
  const schoolYearId = currentSchoolYear?.id ?? null;

  const { schoolClasses, schoolClassesError, schoolClassesIsLoading, schoolClassesIsFetching, loadSchoolClasses } =
    useSchoolClasses({
      filters: { schoolYearId },
      enabled: Boolean(schoolYearId),
    });

  // Liste complète déjà chargée : la recherche se fait sur l'appareil, aussi hors ligne.
  const filteredClasses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return schoolClasses ?? [];
    return (schoolClasses ?? []).filter((schoolClass) =>
      [schoolClass.title, schoolClass.abbreviation, schoolClass.generalClass?.title, getHomeroomTeachersLabel(schoolClass)]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [schoolClasses, searchTerm]);

  const renderClass = useCallback(({ item }: { item: SchoolClass }) => <ClassRow schoolClass={item} />, []);

  return (
    <>
      <Stack.Screen options={{ title: "Classes", headerLeft: () => <DrawerMenuButton /> }} />

      <View className="flex-1 bg-background">
        <View className="px-4 pt-3">
          <SearchBar placeholder="Rechercher une classe" onChangeText={setSearchTerm} />
        </View>

        {schoolClassesIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : schoolClassesError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">Impossible de charger les classes.</Text>
            <Pressable
              onPress={() => loadSchoolClasses()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={filteredClasses}
            keyExtractor={(item) => item.id}
            renderItem={renderClass}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              schoolClasses ? (
                <Text className="px-4 py-2 text-xs text-faint">
                  {filteredClasses.length} classe{filteredClasses.length > 1 ? "s" : ""}
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-faint text-center">
                  {searchTerm.trim() ? "Aucune classe ne correspond à la recherche." : "Aucune classe pour l'année en cours."}
                </Text>
              </View>
            }
            refreshing={schoolClassesIsFetching && !schoolClassesIsLoading}
            onRefresh={loadSchoolClasses}
          />
        )}
      </View>
    </>
  );
}
