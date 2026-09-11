import api from "@/api/client";
import { index } from "@/api/endpoints/incidentType";
import { incidentTypeKeys } from "@/utils/query-keys/incident-type";
import { IncidentType } from "@/utils/types/IncidentType";
import { useListQuery } from "../use-list-query";

export function useIncidentTypes() {
  const query = useListQuery<IncidentType>({
    queryKey: incidentTypeKeys.list(),
    queryFn: () => index(api),
    label: "Types d'incident",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  return {
    incidentTypes: query.data,
    incidentTypesError: query.error,
    incidentTypesIsLoading: query.isLoading,
    loadIncidentTypes: query.refetch,
    incidentTypesIsFetching: query.isFetching,
  };
}
