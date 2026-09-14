import api from "@/api/client";
import { mine } from "@/api/endpoints/service-desk";
import { serviceDeskKeys } from "@/utils/query-keys/service-desk";
import { ServiceDesk } from "@/utils/types/ServiceDesk";
import { useListQuery } from "../use-list-query";

export function useServiceDesksMine() {
  const query = useListQuery<ServiceDesk>({
    queryKey: serviceDeskKeys.mine(),
    queryFn: () => mine(api),
    label: "Guichets",
  });

  return {
    serviceDesks: query.data ?? [],
    serviceDesksError: query.error,
    serviceDesksIsLoading: query.isLoading,
    serviceDesksIsFetching: query.isFetching,
    loadServiceDesks: query.refetch,
  };
}
