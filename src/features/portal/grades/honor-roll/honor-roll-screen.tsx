import { FilterButton } from "@/components/list/filter-button";
import { usePortalStudentRankings } from "@/hooks/queries/items/student-ranking";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { StudentRankingFilterPanel } from "./student-ranking-filter-panel";
import {
  emptyStudentRankingFilters,
  type StudentRankingFiltersForm,
} from "./student-ranking-filters";
import { StudentRankingOwnSummary } from "./student-ranking-own-summary";
import { StudentRankingRow } from "./student-ranking-row";

export function HonorRollScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const [filters, setFilters] = useState<StudentRankingFiltersForm>(
    emptyStudentRankingFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== null).length,
    [filters],
  );

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && selectedSchoolClass?.id,
  );

  const {
    portalStudentRanking,
    portalStudentRankingError,
    portalStudentRankingIsLoading,
    portalStudentRankingIsFetching,
    loadPortalStudentRanking,
  } = usePortalStudentRankings({
    studentId: selectedStudent?.id,
    filters: {
      schoolYearId: selectedSchoolYear?.id,
      schoolClassId: selectedSchoolClass?.id,
      evaluationPeriodId: filters.evaluationPeriodId,
      sysyId: filters.sysyId,
    },
    enabled: filtersAreComplete,
  });

  const displayMode = portalStudentRanking?.displayMode;
  const ranking = portalStudentRanking?.ranking ?? [];
  const totalStudents = portalStudentRanking?.totalStudents ?? 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Palmarès",
        }}
      />

      <View className="flex-1 bg-white">
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
          <StudentRankingFilterPanel
            schoolYearId={selectedSchoolYear.id}
            value={filters}
            onApply={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher son palmarès.
            </Text>
          </View>
        ) : portalStudentRankingIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalStudentRankingError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger le palmarès.
            </Text>
            <Pressable
              onPress={() => loadPortalStudentRanking()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : ranking.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 py-16">
            <Text className="text-sm text-gray-400 text-center">
              Aucun palmarès disponible pour cet élève.
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={portalStudentRankingIsFetching}
                onRefresh={loadPortalStudentRanking}
              />
            }
          >
            {displayMode === "own" ? (
              <StudentRankingOwnSummary
                ranking={ranking[0]}
                totalStudents={totalStudents}
              />
            ) : (
              <>
                <Text className="px-1 pb-2 text-xs text-gray-400">
                  {ranking.length} élève{ranking.length > 1 ? "s" : ""}
                </Text>
                {ranking.map((row) => (
                  <StudentRankingRow
                    key={row.enrollmentNumber}
                    ranking={row}
                  />
                ))}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
