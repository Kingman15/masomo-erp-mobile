import { FilterButton } from "@/components/list/filter-button";
import { useStudentAttendanceRecordSummary, useStudentAttendanceRecords } from "@/hooks/queries/items/student-attendance-record";
import { StudentAttendanceRecord } from "@/utils/types/StudentAttendanceRecord";
import { Stack, router } from "expo-router";
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
import { AttendanceFilterPanel } from "./attendance-filter-panel";
import {
  getDefaultAttendanceFilters,
  type AttendanceFiltersForm,
} from "./attendance-filters";
import { AttendanceRecordDateGroup } from "./attendance-record-date-group";
import { AttendanceSummaryStats } from "./attendance-summary-stats";

function getRecordDateKey(record: StudentAttendanceRecord): string | null {
  const raw = record.session?.attendanceDate;
  if (!raw) return null;
  return raw.slice(0, 10);
}

export function AttendanceScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const [filters, setFilters] = useState<AttendanceFiltersForm>(() =>
    getDefaultAttendanceFilters(),
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = useMemo(
    () =>
      [filters.pointingTypeId, filters.justificationStatusId].filter(
        (value) => value !== null,
      ).length,
    [filters],
  );

  const filtersAreComplete = Boolean(
    selectedStudent?.id &&
      selectedSchoolYear?.id &&
      selectedSchoolClass?.id &&
      filters.startDate &&
      filters.endDate,
  );

  const effectiveFilters = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    studentId: selectedStudent?.id,
    schoolYearId: selectedSchoolYear?.id,
    schoolClassId: selectedSchoolClass?.id,
    pointingTypeId: filters.pointingTypeId,
    justificationStatusId: filters.justificationStatusId,
  };

  const {
    studentAttendanceRecords = [],
    studentAttendanceRecordsError,
    studentAttendanceRecordsIsLoading,
    studentAttendanceRecordsIsFetching,
    loadStudentAttendanceRecords,
  } = useStudentAttendanceRecords({
    filters: effectiveFilters,
    enabled: filtersAreComplete,
  });

  const { studentAttendanceRecordSummary, studentAttendanceRecordSummaryIsFetching, loadStudentAttendanceRecordSummary } =
    useStudentAttendanceRecordSummary({
      filters: effectiveFilters,
      enabled: filtersAreComplete,
    });

  const handleRefresh = () => {
    void loadStudentAttendanceRecords();
    void loadStudentAttendanceRecordSummary();
  };

  const groupedRecords = useMemo(() => {
    const groups = new Map<string, StudentAttendanceRecord[]>();
    for (const record of studentAttendanceRecords) {
      const key = getRecordDateKey(record);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(record);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [studentAttendanceRecords]);

  const handlePressRecord = (record: StudentAttendanceRecord) => {
    router.push(`/portal/menu/discipline/attendance/${record.id}`);
  };

  const isFetching =
    studentAttendanceRecordsIsFetching || studentAttendanceRecordSummaryIsFetching;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Présences",
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

        {filtersOpen && (
          <AttendanceFilterPanel
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
              Sélectionnez un élève pour afficher ses présences.
            </Text>
          </View>
        ) : studentAttendanceRecordsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : studentAttendanceRecordsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les présences.
            </Text>
            <Pressable
              onPress={handleRefresh}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 12 }}
            refreshControl={
              <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
            }
          >
            {studentAttendanceRecordSummary &&
              studentAttendanceRecordSummary.totalRecords > 0 && (
                <View className="px-4 pt-3 pb-1">
                  <AttendanceSummaryStats
                    summary={studentAttendanceRecordSummary}
                  />
                </View>
              )}

            {groupedRecords.length === 0 ? (
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucun pointage trouvé pour les filtres sélectionnés.
                </Text>
              </View>
            ) : (
              groupedRecords.map(([date, records]) => (
                <AttendanceRecordDateGroup
                  key={date}
                  date={date}
                  records={records}
                  onPressRecord={handlePressRecord}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
