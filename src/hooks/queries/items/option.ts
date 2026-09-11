import api from "@/api/client";
import { index } from "@/api/endpoints/option";
import { optionKeys } from "@/utils/query-keys/option";
import { Option } from "@/utils/types/Option";
import { useListQuery } from "../use-list-query";

interface UseOptionsParams {
  filters?: {
    sectionId?: string | null;
  };
  enabled?: boolean;
}

export function useOptions({ filters = {}, enabled }: UseOptionsParams = {}) {
  const normalizedFilters = { sectionId: filters.sectionId ?? null };

  const query = useListQuery<Option>({
    queryKey: optionKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Options",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled,
  });

  return {
    options: query.data ?? [],
    optionsError: query.error,
    optionsIsLoading: query.isLoading,
    optionsIsFetching: query.isFetching,
    loadOptions: query.refetch,
  };
}
