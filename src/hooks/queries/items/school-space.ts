import api from "@/api/client";
import { index } from "@/api/endpoints/schoolSpace";
import { schoolSpaceKeys } from "@/utils/query-keys/school-space";
import { SchoolSpace } from "@/utils/types/SchoolSpace";
import { useListQuery } from "../use-list-query";

interface UseSchoolSpacesParams {
  filters?: {
    schoolBuildingId?: string | null;
  };
  enabled?: boolean;
}

export function useSchoolSpaces({
  filters = {},
  enabled = true,
}: UseSchoolSpacesParams = {}) {
  const normalizedFilters = {
    schoolBuildingId: filters.schoolBuildingId ?? null,
  };

  const query = useListQuery<SchoolSpace>({
    queryKey: schoolSpaceKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Espaces d'enseignement",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled,
  });

  return {
    schoolSpaces: query.data,
    schoolSpacesError: query.error,
    schoolSpacesIsLoading: query.isLoading,
    loadSchoolSpaces: query.refetch,
    schoolSpacesIsFetching: query.isFetching,
  };
}
