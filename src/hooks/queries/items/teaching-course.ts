import api from "@/api/client";
import {
  index,
  show as fetchTeachingCourseById,
} from "@/api/endpoints/teachingCourse";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { teachingCourseKeys } from "@/utils/query-keys/teaching-course";
import { TeachingCourse } from "@/utils/types/TeachingCourse";
import { useDetailQuery } from "../use-detail-query";
import { useListQuery } from "../use-list-query";

interface UseTeachingCoursesParams {
  filters?: {
    schoolYearId?: string | null;
    courseId?: string | null;
    schoolClassId?: string | null;
  };

  enabled?: boolean;
}

export function teachingCoursesQuery(
  filters: UseTeachingCoursesParams["filters"] = {},
): QueryDefinition<TeachingCourse[]> {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? null,
    courseId: filters.courseId ?? null,
    schoolClassId: filters.schoolClassId ?? null,
  };

  return {
    queryKey: teachingCourseKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Enseignements de cours",
  };
}

export function useTeachingCourses({
  filters = {},
  enabled = true,
}: UseTeachingCoursesParams = {}) {
  const query = useListQuery<TeachingCourse>({
    ...teachingCoursesQuery(filters),
    enabled,
    offline: true,
  });

  return {
    teachingCourses: query.data,
    teachingCoursesError: query.error,
    teachingCoursesIsLoading: query.isLoading,
    loadTeachingCourses: query.refetch,
    teachingCoursesIsFetching: query.isFetching,
  };
}

export function useTeachingCourseById(id: string | undefined) {
  const query = useDetailQuery<TeachingCourse>({
    queryKey: teachingCourseKeys.detail(id),
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error("ID is required"));
      }
      return fetchTeachingCourseById(api, id);
    },
    label: "Enseignement de cours",
    id,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  return {
    teachingCourse: query.data,
    teachingCourseIsLoading: query.isLoading,
    teachingCourseError: query.error,
    loadTeachingCourse: query.refetch,
  };
}
