import { ComboBox } from "@/components/list/combo-box";
import { SearchBar } from "@/components/list/search-bar";
import { getSchoolClassLabel } from "@/features/staff/attendance/attendance-labels";
import { DrawerMenuButton } from "@/features/staff/drawer-menu-button";
import { ReportStateView } from "@/features/staff/grades/report-state-view";
import { useCurrentTeacher } from "@/hooks/queries/items/employee";
import { useEnrollments } from "@/hooks/queries/items/enrollment";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear, useSchoolYears } from "@/hooks/queries/items/school-year";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useIsOnline } from "@/lib/offline/use-offline-queue";
import type { Enrollment } from "@/utils/types/Enrollment";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";

function studentLabel(enrollment: Enrollment) {
  return (
    enrollment.student.fullDesignation ??
    enrollment.student.fullName ??
    enrollment.enrollmentNumber ??
    "Élève"
  );
}

// Bulletins des classes dont l'enseignant est titulaire (gate manageReportCards côté API) ; consultation en ligne uniquement.
export function ReportCardsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const isOnline = useIsOnline();

  const [selectedSchoolClassId, setSchoolClassId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Année courante par défaut ; les bulletins des années passées restent consultables.
  const [selectedSchoolYearId, setSchoolYearId] = useState<string | null>(null);
  const { schoolYears, schoolYearsIsLoading } = useSchoolYears();
  const { currentSchoolYear } = useCurrentSchoolYear();
  const schoolYearId = selectedSchoolYearId ?? currentSchoolYear?.id ?? null;

  const { currentTeacher, currentTeacherIsLoading } = useCurrentTeacher();
  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: {
      teacherId: currentTeacher?.id ?? null,
      schoolYearId: schoolYearId ?? null,
      homeroom: true,
    },
    // Sans enseignant courant (direction), toutes les classes ; un enseignant reste limité aux siennes côté serveur.
    enabled: !currentTeacherIsLoading && Boolean(schoolYearId),
  });

  // Une seule classe : sélectionnée d'office (cas le plus courant pour un titulaire).
  const schoolClassId =
    selectedSchoolClassId ??
    (schoolClasses?.length === 1 ? schoolClasses[0].id : null);

  const {
    enrollments,
    enrollmentsError,
    enrollmentsIsLoading,
    enrollmentsIsFetching,
    loadEnrollments,
  } = useEnrollments({
    filters: { schoolYearId, schoolClassId },
    enabled: Boolean(schoolYearId && schoolClassId),
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (enrollments ?? [])
      .filter((enrollment) => studentLabel(enrollment).toLowerCase().includes(term))
      .sort((a, b) => studentLabel(a).localeCompare(studentLabel(b), "fr"));
  }, [enrollments, search]);

  return (
    <>
      <Stack.Screen
        options={{ title: "Bulletins", headerLeft: () => <DrawerMenuButton /> }}
      />

      <View className="flex-1 bg-background">
        <View className="px-4 pt-3 gap-2">
          <ComboBox
            label="Année scolaire"
            placeholder="Sélectionner une année"
            options={(schoolYears ?? []).map((schoolYear) => ({
              id: schoolYear.id,
              label: schoolYear.title,
            }))}
            value={schoolYearId}
            onChange={(id) => {
              setSchoolYearId(id);
              setSchoolClassId(null);
            }}
            loading={schoolYearsIsLoading}
          />

          <ComboBox
            label="Classe"
            placeholder="Sélectionner une classe"
            options={(schoolClasses ?? []).map((schoolClass) => ({
              id: schoolClass.id,
              label: getSchoolClassLabel(schoolClass),
            }))}
            value={schoolClassId}
            onChange={setSchoolClassId}
            loading={currentTeacherIsLoading || schoolClassesIsLoading}
            emptyLabel="Vous n'êtes titulaire d'aucune classe pour cette année"
          />

          {!isOnline && (
            <View className="flex-row items-center gap-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 px-3 py-2">
              <Ionicons name="cloud-offline-outline" size={16} color={colors.foreground} />
              <Text className="flex-1 text-xs text-amber-700 dark:text-amber-300">
                {"Hors ligne : les bulletins ne sont consultables qu'avec une connexion."}
              </Text>
            </View>
          )}

          {schoolClassId && (
            <SearchBar placeholder="Rechercher un élève" onChangeText={setSearch} />
          )}
        </View>

        <ReportStateView
          isSelectionComplete={Boolean(schoolYearId && schoolClassId)}
          selectionHint="Aucun bulletin"
          requirements={[
            { label: "une année scolaire", done: Boolean(schoolYearId) },
            { label: "une classe", done: Boolean(schoolClassId) },
          ]}
          isLoading={enrollmentsIsLoading}
          error={enrollmentsError}
          errorLabel="Impossible de charger les élèves."
          onReload={() => void loadEnrollments()}
          isEmpty={rows.length === 0}
          emptyLabel={search ? "Aucun élève trouvé." : "Aucun élève inscrit dans cette classe."}
        >
          <FlatList
            data={rows}
            keyExtractor={(enrollment) => enrollment.id}
            contentContainerStyle={{ padding: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={enrollmentsIsFetching}
                onRefresh={() => void loadEnrollments()}
              />
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/staff/report-cards/${item.id}`)}
                className="flex-row items-center gap-3 px-3 py-3 border border-border rounded-lg mb-2 bg-card"
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                    {studentLabel(item)}
                  </Text>
                  {item.enrollmentNumber && (
                    <Text className="text-xs text-faint">{item.enrollmentNumber}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.faint} />
              </Pressable>
            )}
          />
        </ReportStateView>
      </View>
    </>
  );
}
