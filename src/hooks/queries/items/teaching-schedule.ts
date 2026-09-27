import api from "@/api/client";
import { byLessonDate, getSchedules } from "@/api/endpoints/teachingSchedule";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { teachingScheduleKeys } from "@/utils/query-keys/teaching-schedule";
import { TeachingSchedule } from "@/utils/types/TeachingSchedule";
import { TeachingScheduleDTO } from "@/utils/types/TeachingScheduleDTO";
import { useListQuery } from "../use-list-query";

interface UseTeachingSchedulesByLessonDateParams {
  filters: {
    schoolYearId?: string | null;
    courseId?: string | null;
    schoolClassId?: string | null;
    lessonDate?: string | null;
  };
  enabled?: boolean;
}

export function useTeachingSchedulesByLessonDate({
  filters,
  enabled,
}: UseTeachingSchedulesByLessonDateParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? null,
    courseId: filters.courseId ?? null,
    schoolClassId: filters.schoolClassId ?? null,
    lessonDate: filters.lessonDate ?? null,
  };

  const query = useListQuery<TeachingSchedule>({
    queryKey: teachingScheduleKeys.byLessonDate(normalizedFilters),
    queryFn: () => byLessonDate(api, normalizedFilters),
    label: "Horaires de cours",
    enabled:
      enabled ??
      Boolean(
        filters.schoolYearId &&
          filters.courseId &&
          filters.schoolClassId &&
          filters.lessonDate,
      ),
  });

  return {
    teachingSchedules: query.data,
    teachingSchedulesError: query.error,
    teachingSchedulesIsLoading: query.isLoading,
    loadTeachingSchedules: query.refetch,
  };
}

interface UseTeachingScheduleDTOsParams {
  filters: {
    courseScheduleId?: string | null;
    schoolClassId?: string | null;
    courseId?: string | null;
  };
  enabled?: boolean;
}

export function teachingScheduleDTOsQuery(
  filters: UseTeachingScheduleDTOsParams["filters"],
): QueryDefinition<TeachingScheduleDTO[]> {
  const normalizedFilters = {
    courseScheduleId: filters.courseScheduleId ?? null,
    schoolClassId: filters.schoolClassId ?? null,
    courseId: filters.courseId ?? null,
  };

  return {
    queryKey: teachingScheduleKeys.schedules(normalizedFilters),
    queryFn: () => getSchedules(api, normalizedFilters),
    label: "Horaire d'enseignement",
  };
}

export function useTeachingScheduleDTOs({
  filters,
  enabled,
}: UseTeachingScheduleDTOsParams) {
  const query = useListQuery<TeachingScheduleDTO>({
    ...teachingScheduleDTOsQuery(filters),
    enabled: enabled ?? Boolean(filters.courseScheduleId),
    offline: true,
  });

  return {
    teachingScheduleDTOs: query.data,
    teachingScheduleDTOsError: query.error,
    teachingScheduleDTOsIsLoading: query.isLoading,
    loadTeachingScheduleDTOs: query.refetch,
    teachingScheduleDTOsIsFetching: query.isFetching,
  };
}
