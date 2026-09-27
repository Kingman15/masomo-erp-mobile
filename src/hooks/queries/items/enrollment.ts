import api from "@/api/client";
import { currentEnrollments, index } from "@/api/endpoints/enrollment";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
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

export function enrollmentsQuery(
  filters: UseEnrollmentsParams["filters"],
): QueryDefinition<Enrollment[]> {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? null,
    schoolClassId: filters.schoolClassId ?? null,
    sortBy: filters.sortBy ?? null,
    sortDirection: filters.sortDirection ?? null,
    withoutAttendanceSessionId: filters.withoutAttendanceSessionId ?? null,
  };

  return {
    queryKey: enrollmentKeys.list(normalizedFilters),
    queryFn: () =>
      index(api, normalizedFilters, 1, "all").then((response) => response.data),
    label: "Inscriptions",
  };
}

// Liste complète (perPage = "all"), comme le pointage de présences du web.
export function useEnrollments({
  filters,
  enabled = true,
}: UseEnrollmentsParams) {
  const query = useListQuery<Enrollment>({
    ...enrollmentsQuery(filters),
    enabled,
    // Seule la liste complète d'une classe est gardée hors ligne : celle filtrée par session change à chaque pointage.
    offline: !filters.withoutAttendanceSessionId,
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
