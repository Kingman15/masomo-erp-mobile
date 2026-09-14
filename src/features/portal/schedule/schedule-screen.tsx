import { ChipSelect } from "@/components/list/chip-select";
import { useCourses } from "@/hooks/queries/items/course";
import { useActiveCourseSchedule } from "@/hooks/queries/items/course-schedule";
import { useTeachingScheduleDTOs } from "@/hooks/queries/items/teaching-schedule";
import { Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePortalSelection } from "../use-portal-selection";
import { getRowsForDay, getVisibleDays, jsDayToDayField } from "./schedule-days";
import { ScheduleSlotRow } from "./schedule-slot-row";

export function ScheduleScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && selectedSchoolClass?.id,
  );

  const {
    activeCourseSchedule,
    activeCourseScheduleIsLoading,
    activeCourseScheduleError,
    loadActiveCourseSchedule,
  } = useActiveCourseSchedule({
    schoolYearId: selectedSchoolYear?.id,
    enabled: filtersAreComplete,
  });

  const {
    teachingScheduleDTOs = [],
    teachingScheduleDTOsIsLoading,
    teachingScheduleDTOsError,
    teachingScheduleDTOsIsFetching,
    loadTeachingScheduleDTOs,
  } = useTeachingScheduleDTOs({
    filters: {
      courseScheduleId: activeCourseSchedule?.id,
      schoolClassId: selectedSchoolClass?.id,
    },
    enabled: filtersAreComplete && !!activeCourseSchedule?.id,
  });

  const { courses = [] } = useCourses({
    filters: {
      schoolYearId: selectedSchoolYear?.id,
      schoolClassId: selectedSchoolClass?.id,
    },
    enabled: filtersAreComplete,
  });

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const visibleDays = useMemo(
    () => getVisibleDays(teachingScheduleDTOs),
    [teachingScheduleDTOs],
  );

  // Présélectionne le jour courant s'il a cours, sinon le premier jour disponible ;
  // ne touche pas au choix de l'utilisateur tant que le jour actif reste visible.
  useEffect(() => {
    if (visibleDays.length === 0) {
      if (selectedDay !== null) setSelectedDay(null);
      return;
    }
    if (selectedDay !== null && visibleDays.some((d) => d.day === selectedDay)) return;

    const todayDay = jsDayToDayField(new Date().getDay());
    const todayIsVisible = visibleDays.some((d) => d.day === todayDay);
    setSelectedDay(todayIsVisible ? todayDay : visibleDays[0].day);
  }, [visibleDays, selectedDay]);

  const activeDay = visibleDays.find((d) => d.day === selectedDay) ?? null;

  const rowsForActiveDay = useMemo(() => {
    if (!activeDay) return [];
    const rows = getRowsForDay(teachingScheduleDTOs, activeDay);
    if (!selectedCourseId) return rows;
    return rows.filter((row) => row.courseId === selectedCourseId);
  }, [teachingScheduleDTOs, activeDay, selectedCourseId]);

  const isLoading = activeCourseScheduleIsLoading || teachingScheduleDTOsIsLoading;
  const error = activeCourseScheduleError || teachingScheduleDTOsError;

  const handleRefresh = () => {
    void loadActiveCourseSchedule();
    void loadTeachingScheduleDTOs();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Emploi du temps" }} />

      <View className="flex-1 bg-white">
        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher son emploi du temps.
            </Text>
          </View>
        ) : isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger l'emploi du temps.
            </Text>
            <Pressable
              onPress={handleRefresh}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : !activeCourseSchedule ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun horaire actif
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Aucun horaire de cours n'est actif pour cette année scolaire.
            </Text>
          </View>
        ) : teachingScheduleDTOs.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Emploi du temps indisponible
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              L'emploi du temps n'a pas encore été publié pour cette classe.
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={teachingScheduleDTOsIsFetching}
                onRefresh={handleRefresh}
              />
            }
          >
            <View className="px-4 pt-3">
              <ChipSelect
                label="Jour"
                options={visibleDays.map((d) => ({ id: String(d.day), label: d.short }))}
                value={selectedDay !== null ? String(selectedDay) : null}
                onChange={(id) => id && setSelectedDay(Number(id))}
              />

              {courses.length > 0 && (
                <ChipSelect
                  label="Cours"
                  options={courses.map((c) => ({ id: c.id, label: c.shortName ?? c.name }))}
                  value={selectedCourseId}
                  onChange={setSelectedCourseId}
                />
              )}
            </View>

            {rowsForActiveDay.length === 0 ? (
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  {selectedCourseId
                    ? "Aucun cours ne correspond à ce filtre."
                    : "Aucun cours ce jour-là."}
                </Text>
              </View>
            ) : (
              <View className="border-t border-gray-100 mt-1">
                {rowsForActiveDay.map((row, index) => (
                  <ScheduleSlotRow key={row.id} item={row} isFirst={index === 0} />
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
