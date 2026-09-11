import api from "@/api/client";
import { active } from "@/api/endpoints/courseSchedule";
import { courseScheduleKeys } from "@/utils/query-keys/course-schedule";
import { CourseSchedule } from "@/utils/types/CourseSchedule";
import { useSingletonQuery } from "../use-singleton-query";

interface UseActiveCourseScheduleParams {
  schoolYearId?: string | null;
  enabled?: boolean;
}

export function useActiveCourseSchedule({
  schoolYearId,
  enabled,
}: UseActiveCourseScheduleParams = {}) {
  const query = useSingletonQuery<CourseSchedule | null>({
    queryKey: courseScheduleKeys.active(schoolYearId),
    queryFn: () => active(api, schoolYearId),
    label: "Horaire actif",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: enabled ?? Boolean(schoolYearId),
  });

  return {
    activeCourseSchedule: query.data,
    activeCourseScheduleError: query.error,
    activeCourseScheduleIsLoading: query.isLoading,
    loadActiveCourseSchedule: query.refetch,
    activeCourseScheduleIsFetching: query.isFetching,
  };
}
