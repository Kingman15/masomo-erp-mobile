import api from "@/api/client";
import { index } from "@/api/endpoints/sanctionType";
import { sanctionTypeKeys } from "@/utils/query-keys/sanction-type";
import { SanctionType } from "@/utils/types/SanctionType";
import { useListQuery } from "../use-list-query";

export function useSanctionTypes() {
  const query = useListQuery<SanctionType>({
    queryKey: sanctionTypeKeys.list(),
    queryFn: () => index(api),
    label: "Types de sanction",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  return {
    sanctionTypes: query.data,
    sanctionTypesError: query.error,
    sanctionTypesIsLoading: query.isLoading,
    loadSanctionTypes: query.refetch,
    sanctionTypesIsFetching: query.isFetching,
  };
}
