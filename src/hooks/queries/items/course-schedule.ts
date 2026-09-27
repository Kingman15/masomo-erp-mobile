import api from "@/api/client";
import { active } from "@/api/endpoints/courseSchedule";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { courseScheduleKeys } from "@/utils/query-keys/course-schedule";
import { CourseSchedule } from "@/utils/types/CourseSchedule";
import { useSingletonQuery } from "../use-singleton-query";

interface UseActiveCourseScheduleParams {
  schoolYearId?: string | null;
  enabled?: boolean;
}

export function activeCourseScheduleQuery(
  schoolYearId?: string | null,
): QueryDefinition<CourseSchedule | null> {
  return {
    queryKey: courseScheduleKeys.active(schoolYearId),
    queryFn: () => active(api, schoolYearId),
    label: "Horaire actif",
  };
}

export function useActiveCourseSchedule({
  schoolYearId,
  enabled,
}: UseActiveCourseScheduleParams = {}) {
  const query = useSingletonQuery<CourseSchedule | null>({
    ...activeCourseScheduleQuery(schoolYearId),
    staleTime: Infinity,
    enabled: enabled ?? Boolean(schoolYearId),
    offline: true,
  });

  return {
    activeCourseSchedule: query.data,
    activeCourseScheduleError: query.error,
    activeCourseScheduleIsLoading: query.isLoading,
    loadActiveCourseSchedule: query.refetch,
    activeCourseScheduleIsFetching: query.isFetching,
  };
}
