import api from "@/api/client";
import { index } from "@/api/endpoints/incidentType";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { incidentTypeKeys } from "@/utils/query-keys/incident-type";
import { IncidentType } from "@/utils/types/IncidentType";
import { useListQuery } from "../use-list-query";

export function incidentTypesQuery(): QueryDefinition<IncidentType[]> {
  return {
    queryKey: incidentTypeKeys.list(),
    queryFn: () => index(api),
    label: "Types d'incident",
  };
}

export function useIncidentTypes() {
  const query = useListQuery<IncidentType>({
    ...incidentTypesQuery(),
    staleTime: Infinity,
    offline: true,
  });

  return {
    incidentTypes: query.data,
    incidentTypesError: query.error,
    incidentTypesIsLoading: query.isLoading,
    loadIncidentTypes: query.refetch,
    incidentTypesIsFetching: query.isFetching,
  };
}
