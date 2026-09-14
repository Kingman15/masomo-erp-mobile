import api from "@/api/client";
import { index } from "@/api/endpoints/guardian";
import { guardianKeys } from "@/utils/query-keys/guardian";
import { Guardian } from "@/utils/types/Guardian";
import { useListQuery } from "../use-list-query";

interface UseGuardiansParams {
  filters: {
    schoolYearId?: string | null;
    searchTerm?: string | null;
  };
  enabled?: boolean;
}

export function useGuardians({ filters, enabled = true }: UseGuardiansParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    searchTerm: filters.searchTerm?.trim() || undefined,
  };

  const query = useListQuery<Guardian>({
    queryKey: guardianKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Parents",
    enabled: Boolean(filters.schoolYearId) && enabled,
  });

  return {
    guardians: query.data ?? [],
    guardiansError: query.error,
    guardiansIsLoading: query.isLoading,
    guardiansIsFetching: query.isFetching,
    loadGuardians: query.refetch,
  };
}
