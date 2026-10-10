import { ComboBox } from "@/components/list/combo-box";
import { FilterButton } from "@/components/list/filter-button";
import { CourseAverageFilterPanel } from "@/features/portal/grades/averages/course-average-filter-panel";
import {
  emptyCourseAverageFilters,
  type CourseAverageFiltersForm,
} from "@/features/portal/grades/averages/course-average-filters";
import { StudentRankingRow } from "@/features/portal/grades/honor-roll/student-ranking-row";
import { getSchoolClassLabel } from "@/features/staff/attendance/attendance-labels";
import { DrawerMenuButton } from "@/features/staff/drawer-menu-button";
import { useCourseAverages } from "@/hooks/queries/items/course-average";
import { useCurrentTeacher } from "@/hooks/queries/items/employee";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear, useSchoolYears } from "@/hooks/queries/items/school-year";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { ReportStateView } from "./report-state-view";

// Moyennes des élèves dans les cours de l'enseignant : l'API ne renvoie que ses propres cours (CourseAverageController).
export function CourseAveragesScreen() {
  const [selectedSchoolClassId, setSchoolClassId] = useState<string | null>(null);
  const [selectedFollowCourseId, setFollowCourseId] = useState<string | null>(null);
  const [filters, setFilters] = useState<CourseAverageFiltersForm>(
    emptyCourseAverageFilters,
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
    },
    // Sans enseignant courant (direction), toutes les classes ; un enseignant reste limité aux siennes côté serveur.
    enabled: !currentTeacherIsLoading && Boolean(schoolYearId),
  });

  const schoolClassId =
    selectedSchoolClassId ??
    (schoolClasses?.length === 1 ? schoolClasses[0].id : null);

  const {
    courseAverages,
    courseAveragesError,
    courseAveragesIsLoading,
    courseAveragesIsFetching,
    loadCourseAverages,
  } = useCourseAverages({
    filters: {
      schoolYearId,
      schoolClassId,
      schoolPeriodId: filters.schoolPeriodId,
      schoolYearTermId: filters.schoolYearTermId,
    },
  });

  // Cours présents dans la réponse, dans l'ordre alphabétique.
  const courses = useMemo(() => {
    const byId = new Map<string, string>();
    for (const row of courseAverages) {
      if (!byId.has(row.followCourseId)) byId.set(row.followCourseId, row.courseName);
    }
    return [...byId.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [courseAverages]);

  // Cours choisi s'il existe encore pour cette classe, sinon le premier.
  const followCourseId =
    courses.find((course) => course.id === selectedFollowCourseId)?.id ??
    courses[0]?.id ??
    null;

  const rows = useMemo(
    () =>
      courseAverages
        .filter((row) => row.followCourseId === followCourseId)
        .sort((a, b) => a.studentName.localeCompare(b.studentName)),
    [courseAverages, followCourseId],
  );

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== null).length,
    [filters],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Moyennes par cours",
          headerLeft: () => <DrawerMenuButton />,
        }}
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
              setFollowCourseId(null);
              setFilters(emptyCourseAverageFilters);
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
            onChange={(id) => {
              setSchoolClassId(id);
              setFollowCourseId(null);
            }}
            loading={currentTeacherIsLoading || schoolClassesIsLoading}
            emptyLabel="Aucune classe pour cette année"
          />

          {schoolClassId && courses.length > 0 && (
            <ComboBox
              label="Cours"
              placeholder="Sélectionner un cours"
              options={courses}
              value={followCourseId}
              onChange={setFollowCourseId}
            />
          )}
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
          <CourseAverageFilterPanel
            schoolYearId={schoolYearId}
            value={filters}
            onApply={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        <ReportStateView
          isSelectionComplete={Boolean(schoolYearId && schoolClassId)}
          selectionHint="Aucune moyenne"
          requirements={[
            { label: "une année scolaire", done: Boolean(schoolYearId) },
            { label: "une classe", done: Boolean(schoolClassId) },
          ]}
          isLoading={courseAveragesIsLoading}
          error={courseAveragesError}
          errorLabel="Impossible de charger les moyennes."
          onReload={() => void loadCourseAverages()}
          isEmpty={rows.length === 0}
          emptyLabel="Aucune note pour vos cours dans cette classe sur la période choisie."
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={courseAveragesIsFetching}
                onRefresh={() => void loadCourseAverages()}
              />
            }
          >
            <Text className="px-1 pb-2 text-xs text-faint">
              {rows.length} élève{rows.length > 1 ? "s" : ""}
            </Text>
            {/* Mêmes champs qu'une ligne de palmarès : position, élève, points, pourcentage. */}
            {rows.map((row) => (
              <StudentRankingRow key={row.enrollmentNumber} ranking={row} />
            ))}
          </ScrollView>
        </ReportStateView>
      </View>
    </>
  );
}
