import api from "@/api/client";
import { byLessonDate } from "@/api/endpoints/teachingSchedule";
import { teachingScheduleKeys } from "@/utils/query-keys/teaching-schedule";
import { TeachingSchedule } from "@/utils/types/TeachingSchedule";
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
