import api from "@/api/client";
import { index } from "@/api/endpoints/schoolSpace";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { schoolSpaceKeys } from "@/utils/query-keys/school-space";
import { SchoolSpace } from "@/utils/types/SchoolSpace";
import { useListQuery } from "../use-list-query";

interface UseSchoolSpacesParams {
  filters?: {
    schoolBuildingId?: string | null;
  };
  enabled?: boolean;
}

export function schoolSpacesQuery(
  filters: UseSchoolSpacesParams["filters"] = {},
): QueryDefinition<SchoolSpace[]> {
  const normalizedFilters = {
    schoolBuildingId: filters.schoolBuildingId ?? null,
  };

  return {
    queryKey: schoolSpaceKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Espaces d'enseignement",
  };
}

export function useSchoolSpaces({
  filters = {},
  enabled = true,
}: UseSchoolSpacesParams = {}) {
  const query = useListQuery<SchoolSpace>({
    ...schoolSpacesQuery(filters),
    staleTime: Infinity,
    enabled,
    offline: true,
  });

  return {
    schoolSpaces: query.data,
    schoolSpacesError: query.error,
    schoolSpacesIsLoading: query.isLoading,
    loadSchoolSpaces: query.refetch,
    schoolSpacesIsFetching: query.isFetching,
  };
}
