import { ComboBox } from "@/components/list/combo-box";
import { FilterButton } from "@/components/list/filter-button";
import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { useCurrentTeacher } from "@/hooks/queries/items/employee";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import { useStudentAttendanceRecords } from "@/hooks/queries/items/student-attendance-record";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { StudentAttendanceRecord } from "@/utils/types/StudentAttendanceRecord";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Stack, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { AttendanceFilterPanel } from "./attendance-filter-panel";
import {
  emptyAttendanceFilters,
  type AttendanceFiltersForm,
} from "./attendance-filters";
import { getSchoolClassLabel } from "./attendance-labels";
import { AttendanceRecordRow } from "./attendance-record-row";
import { AttendanceSessionPicker } from "./attendance-session-picker";
import { useAttendanceRegistersSessions } from "./use-attendance-registers-sessions";

export function AttendanceRecordsScreen() {
  const colors = useThemeColors();
  const [selectedSessionId, setSessionId] = useState<string | null>(null);
  const [selectedSchoolClassId, setSchoolClassId] = useState<string | null>(
    null,
  );
  const [filters, setFilters] = useState<AttendanceFiltersForm>(
    emptyAttendanceFilters,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { currentSchoolYear } = useCurrentSchoolYear();

  const {
    registerId,
    setRegisterId,
    registers,
    registersIsLoading,
    sessions,
    sessionsIsLoading,
  } = useAttendanceRegistersSessions({
    schoolYearId: currentSchoolYear?.id,
  });

  // Une seule session disponible : elle est sélectionnée d'office.
  const sessionId =
    selectedSessionId ?? (sessions?.length === 1 ? sessions[0].id : null);

  const { currentTeacher, currentTeacherIsLoading } = useCurrentTeacher();
  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: { teacherId: currentTeacher?.id ?? null },
    enabled: !currentTeacherIsLoading,
  });

  // Idem pour la classe.
  const schoolClassId =
    selectedSchoolClassId ??
    (schoolClasses?.length === 1 ? schoolClasses[0].id : null);

  const isSelectionComplete = Boolean(sessionId && schoolClassId);

  const {
    studentAttendanceRecords,
    studentAttendanceRecordsError,
    studentAttendanceRecordsIsLoading,
    studentAttendanceRecordsIsFetching,
    loadStudentAttendanceRecords,
  } = useStudentAttendanceRecords({
    filters: { ...filters, sessionId, schoolClassId },
    enabled: isSelectionComplete,
  });

  useEffect(() => {
    if (studentAttendanceRecordsError) {
      console.error(
        "[attendance] Erreur de chargement",
        studentAttendanceRecordsError,
      );
    }
  }, [studentAttendanceRecordsError]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== null).length,
    [filters],
  );

  const renderRecord = useCallback(
    ({ item }: { item: StudentAttendanceRecord }) => (
      <AttendanceRecordRow
        record={item}
        onPress={(record) => router.push(`/teacher/attendance/${record.id}`)}
      />
    ),
    [],
  );

  const selectionParams = {
    registerId: registerId ?? undefined,
    sessionId: sessionId ?? undefined,
    schoolClassId: schoolClassId ?? undefined,
  };

  const total = studentAttendanceRecords?.length ?? 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Présences",
          headerLeft: () => <DrawerMenuButton />,
          headerRight: () => (
            <View className="flex-row items-center gap-4">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/teacher/attendance/bulk",
                    params: selectionParams,
                  })
                }
                hitSlop={8}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={24}
                  color={colors.foreground}
                />
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/teacher/attendance/new",
                    params: selectionParams,
                  })
                }
                hitSlop={8}
              >
                <Ionicons name="add-outline" size={26} color={colors.foreground} />
              </Pressable>
            </View>
          ),
        }}
      />

      <View className="flex-1 bg-background">
        <View className="px-4 pt-3">
          <AttendanceSessionPicker
            registers={registers}
            registersIsLoading={registersIsLoading}
            registerId={registerId}
            onRegisterChange={setRegisterId}
            sessions={sessions}
            sessionsIsLoading={sessionsIsLoading}
            sessionId={sessionId}
            onSessionChange={setSessionId}
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
            loading={schoolClassesIsLoading}
            emptyLabel="Aucune classe disponible"
          />
        </View>

        <View className="flex-row items-center justify-between px-4 pb-2">
          <Text className="text-xs text-faint">
            {isSelectionComplete
              ? `${total} pointage${total > 1 ? "s" : ""}`
              : "Session et classe requises"}
          </Text>
          <FilterButton
            activeCount={activeFilterCount}
            onPress={() => setFiltersOpen((open) => !open)}
          />
        </View>

        {filtersOpen && (
          <AttendanceFilterPanel
            value={filters}
            onApply={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        {!isSelectionComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Ionicons name="calendar-outline" size={32} color={colors.faint} />
            <Text className="text-sm text-faint text-center">
              Sélectionnez une session de présences et une classe pour
              afficher les pointages.
            </Text>
          </View>
        ) : studentAttendanceRecordsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : studentAttendanceRecordsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger les pointages de présences.
            </Text>
            <Pressable
              onPress={() => loadStudentAttendanceRecords()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <FlashList
            data={studentAttendanceRecords ?? []}
            keyExtractor={(item) => item.id}
            renderItem={renderRecord}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-16 gap-3">
                <Text className="text-sm text-faint text-center">
                  Aucun pointage pour cette session.
                </Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/teacher/attendance/bulk",
                      params: selectionParams,
                    })
                  }
                  className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
                >
                  <Text className="text-background font-medium">
                    Pointer les présences
                  </Text>
                </Pressable>
              </View>
            }
            refreshing={
              studentAttendanceRecordsIsFetching &&
              !studentAttendanceRecordsIsLoading
            }
            onRefresh={loadStudentAttendanceRecords}
          />
        )}
      </View>
    </>
  );
}
