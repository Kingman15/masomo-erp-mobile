import api from "@/api/client";
import { currentEnrollments } from "@/api/endpoints/enrollment";
import { enrollmentKeys } from "@/utils/query-keys/enrollment";
import { Enrollment } from "@/utils/types/Enrollment";
import { useListQuery } from "../use-list-query";

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
