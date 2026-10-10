import { ComboBox } from "@/components/list/combo-box";
import { FilterButton } from "@/components/list/filter-button";
import { StudentRankingFilterPanel } from "@/features/portal/grades/honor-roll/student-ranking-filter-panel";
import {
  emptyStudentRankingFilters,
  type StudentRankingFiltersForm,
} from "@/features/portal/grades/honor-roll/student-ranking-filters";
import { StudentRankingRow } from "@/features/portal/grades/honor-roll/student-ranking-row";
import { getSchoolClassLabel } from "@/features/staff/attendance/attendance-labels";
import { DrawerMenuButton } from "@/features/staff/drawer-menu-button";
import { useCurrentTeacher } from "@/hooks/queries/items/employee";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear, useSchoolYears } from "@/hooks/queries/items/school-year";
import { useStudentRankings } from "@/hooks/queries/items/student-ranking";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { ReportStateView } from "./report-state-view";

// Palmarès des classes dont l'enseignant est titulaire (StudentRankingPolicy côté API).
export function HonorRollScreen() {
  const [selectedSchoolClassId, setSchoolClassId] = useState<string | null>(null);
  const [filters, setFilters] = useState<StudentRankingFiltersForm>(
    emptyStudentRankingFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Année courante par défaut ; les années passées restent consultables.
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
    studentRankings,
    studentRankingsError,
    studentRankingsIsLoading,
    studentRankingsIsFetching,
    loadStudentRankings,
  } = useStudentRankings({
    filters: {
      schoolYearId,
      schoolClassId,
      schoolPeriodId: filters.schoolPeriodId,
      schoolYearTermId: filters.schoolYearTermId,
    },
  });

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== null).length,
    [filters],
  );

  return (
    <>
      <Stack.Screen
        options={{ title: "Palmarès", headerLeft: () => <DrawerMenuButton /> }}
      />

      <View className="flex-1 bg-background">
        <View className="px-4 pt-3">
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
              setFilters(emptyStudentRankingFilters);
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
        </View>

        {schoolClassId && schoolYearId && (
          <View className="flex-row items-center gap-3 px-4 pb-2">
            <FilterButton
              fullWidth
              activeCount={activeFilterCount}
              onPress={() => setFiltersOpen((open) => !open)}
            />
          </View>
        )}

        {filtersOpen && schoolYearId && (
          <StudentRankingFilterPanel
            schoolYearId={schoolYearId}
            value={filters}
            onApply={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        <ReportStateView
          isSelectionComplete={Boolean(schoolYearId && schoolClassId)}
          selectionHint="Aucun palmarès"
          requirements={[
            { label: "une année scolaire", done: Boolean(schoolYearId) },
            { label: "une classe", done: Boolean(schoolClassId) },
          ]}
          isLoading={studentRankingsIsLoading}
          error={studentRankingsError}
          errorLabel="Impossible de charger le palmarès."
          onReload={() => void loadStudentRankings()}
          isEmpty={studentRankings.length === 0}
          emptyLabel="Aucun résultat pour cette classe sur la période choisie."
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={studentRankingsIsFetching}
                onRefresh={() => void loadStudentRankings()}
              />
            }
          >
            <Text className="px-1 pb-2 text-xs text-faint">
              {studentRankings.length} élève{studentRankings.length > 1 ? "s" : ""}
            </Text>
            {studentRankings.map((row) => (
              <StudentRankingRow key={row.enrollmentNumber} ranking={row} />
            ))}
          </ScrollView>
        </ReportStateView>
      </View>
    </>
  );
}
