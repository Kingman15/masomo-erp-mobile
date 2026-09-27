import api from "@/api/client";
import { followed, index } from "@/api/endpoints/course";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
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

export function followedCoursesQuery({
  schoolYearId,
  schoolClassId,
  teacherId,
}: UseFollowedCoursesParams): QueryDefinition<Course[]> {
  const filters = { schoolYearId, schoolClassId, teacherId };

  return {
    queryKey: courseKeys.followed(filters),
    queryFn: () => followed(api, filters),
    label: "Cours",
  };
}

export function useFollowedCourses({
  schoolYearId,
  schoolClassId,
  teacherId,
}: UseFollowedCoursesParams) {
  const query = useListQuery<Course>({
    ...followedCoursesQuery({ schoolYearId, schoolClassId, teacherId }),
    staleTime: Infinity,
    enabled: Boolean(schoolYearId) && Boolean(schoolClassId),
    offline: true,
  });

  return {
    courses: query.data,
    coursesError: query.error,
    coursesIsLoading: query.isLoading,
    loadCourses: query.refetch,
    coursesIsFetching: query.isFetching,
  };
}
