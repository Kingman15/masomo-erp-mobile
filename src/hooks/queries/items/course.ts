import api from "@/api/client";
import { followed, index } from "@/api/endpoints/course";
import { courseKeys } from "@/utils/query-keys/course";
import { Course } from "@/utils/types/Course";
import { useListQuery } from "../use-list-query";

interface UseCoursesParams {
  filters?: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    teacherId?: string | null;
  };

  enabled?: boolean;
}

export function useCourses({
  filters = {},
  enabled = true,
}: UseCoursesParams = {}) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? null,
    schoolClassId: filters.schoolClassId ?? null,
    teacherId: filters.teacherId ?? null,
  };

  const query = useListQuery<Course>({
    queryKey: courseKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Cours",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled,
  });

  return {
    courses: query.data,
    coursesError: query.error,
    coursesIsLoading: query.isLoading,
    loadCourses: query.refetch,
    coursesIsFetching: query.isFetching,
  };
}

interface UseFollowedCoursesParams {
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  teacherId?: string | null;
}

export function useFollowedCourses({
  schoolYearId,
  schoolClassId,
  teacherId,
}: UseFollowedCoursesParams) {
  const filters = { schoolYearId, schoolClassId, teacherId };

  const query = useListQuery<Course>({
    queryKey: courseKeys.followed(filters),
    queryFn: () => followed(api, filters),
    label: "Cours",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: Boolean(schoolYearId) && Boolean(schoolClassId),
  });

  return {
    courses: query.data,
    coursesError: query.error,
    coursesIsLoading: query.isLoading,
    loadCourses: query.refetch,
    coursesIsFetching: query.isFetching,
  };
}
