import api from "@/api/client";
import { currentStudents, index } from "@/api/endpoints/student";
import { studentKeys } from "@/utils/query-keys/student";
import { Student } from "@/utils/types/Student";
import { useInfiniteScrollQuery } from "../use-infinite-scroll-query";
import { useListQuery } from "../use-list-query";

interface UseStudentsParams {
  filters: {
    schoolYearId?: string | null;
    searchTerm?: string | null;
  };

  enabled?: boolean;
}

export function useStudents({ filters, enabled = true }: UseStudentsParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    searchTerm: filters.searchTerm ?? undefined,
  };

  const query = useInfiniteScrollQuery<Student>({
    queryKey: studentKeys.list(normalizedFilters),
    queryFn: (page, perPage) => index(api, normalizedFilters, page, perPage),
    label: "Élèves",
    enabled: Boolean(filters.schoolYearId) && enabled,
  });

  return {
    students: query.items,
    studentsMeta: query.meta,
    studentsError: query.error,
    studentsIsLoading: query.isLoading,
    studentsIsFetching: query.isFetching,
    studentsIsFetchingNextPage: query.isFetchingNextPage,
    studentsIsRefetching: query.isRefetching,
    studentsHasNextPage: query.hasNextPage,
    fetchNextStudents: query.fetchNextPage,
    loadStudents: query.refetch,
  };
}

interface UseCurrentStudentsParams {
  enabled?: boolean;
}

export function useCurrentStudents({
  enabled = true,
}: UseCurrentStudentsParams = {}) {
  const query = useListQuery<Student>({
    queryKey: studentKeys.currentStudents(),
    queryFn: () => currentStudents(api),
    label: "Mes enfants",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled,
  });

  return {
    students: query.data,
    studentsError: query.error,
    studentsIsLoading: query.isLoading,
    loadStudents: query.refetch,
    studentsIsFetching: query.isFetching,
  };
}
