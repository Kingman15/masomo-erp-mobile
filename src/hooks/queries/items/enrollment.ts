import api from "@/api/client";
import { currentEnrollments, index } from "@/api/endpoints/enrollment";
import { enrollmentKeys } from "@/utils/query-keys/enrollment";
import { Enrollment } from "@/utils/types/Enrollment";
import { useListQuery } from "../use-list-query";

interface UseEnrollmentsParams {
  filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    sortBy?: string | null;
    sortDirection?: "asc" | "desc" | null;
    withoutAttendanceSessionId?: string | null;
  };
  enabled?: boolean;
}

// Liste complète (perPage = "all"), comme le pointage de présences du web.
export function useEnrollments({
  filters,
  enabled = true,
}: UseEnrollmentsParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? null,
    schoolClassId: filters.schoolClassId ?? null,
    sortBy: filters.sortBy ?? null,
    sortDirection: filters.sortDirection ?? null,
    withoutAttendanceSessionId: filters.withoutAttendanceSessionId ?? null,
  };

  const query = useListQuery<Enrollment>({
    queryKey: enrollmentKeys.list(normalizedFilters),
    queryFn: () =>
      index(api, normalizedFilters, 1, "all").then((response) => response.data),
    label: "Inscriptions",
    enabled,
  });

  return {
    enrollments: query.data,
    enrollmentsError: query.error,
    enrollmentsIsLoading: query.isLoading,
    loadEnrollments: query.refetch,
    enrollmentsIsFetching: query.isFetching,
  };
}

interface UseCurrentEnrollmentsParams {
  filters?: {
    schoolYearId?: string | null;
  };
  enabled?: boolean;
}

export function useCurrentEnrollments({
  filters = {},
  enabled = true,
}: UseCurrentEnrollmentsParams = {}) {
  const normalizedFilters = { schoolYearId: filters.schoolYearId ?? null };

  const query = useListQuery<Enrollment>({
    queryKey: enrollmentKeys.currentEnrollments(normalizedFilters),
    queryFn: () => currentEnrollments(api, normalizedFilters),
    label: "Inscriptions courantes",
    enabled,
  });

  return {
    enrollments: query.data,
    enrollmentsError: query.error,
    enrollmentsIsLoading: query.isLoading,
    loadEnrollments: query.refetch,
  };
}
