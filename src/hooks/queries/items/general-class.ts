import api from "@/api/client";
import { index } from "@/api/endpoints/generalClass";
import { generalClassKeys } from "@/utils/query-keys/general-class";
import { GeneralClass } from "@/utils/types/GeneralClass";
import { useListQuery } from "../use-list-query";

interface UseGeneralClassesParams {
  filters?: {
    sectionId?: string | null;
    optionId?: string | null;
  };
  enabled?: boolean;
}

export function useGeneralClasses({
  filters = {},
  enabled,
}: UseGeneralClassesParams = {}) {
  const normalizedFilters = {
    sectionId: filters.sectionId ?? null,
    optionId: filters.optionId ?? null,
  };

  const query = useListQuery<GeneralClass>({
    queryKey: generalClassKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Classes générales",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled,
  });

  return {
    generalClasses: query.data ?? [],
    generalClassesError: query.error,
    generalClassesIsLoading: query.isLoading,
    generalClassesIsFetching: query.isFetching,
    loadGeneralClasses: query.refetch,
  };
}
