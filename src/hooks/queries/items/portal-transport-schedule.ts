import api from "@/api/client";
import { index } from "@/api/endpoints/portal-transport-schedule";
import { portalTransportScheduleKeys } from "@/utils/query-keys/portal-transport-schedule";
import type { PortalTransportScheduleDTO } from "@/utils/types/objects/PortalTransportScheduleDTO";
import { useListQuery } from "../use-list-query";

interface UsePortalTransportSchedulesParams {
  studentId?: string | null;
  enabled?: boolean;
}

export function usePortalTransportSchedules({
  studentId,
  enabled = true,
}: UsePortalTransportSchedulesParams) {
  const query = useListQuery<PortalTransportScheduleDTO>({
    queryKey: portalTransportScheduleKeys.list(studentId),
    queryFn: () => index(api, studentId!),
    label: "Horaires de transport",
    enabled: enabled && Boolean(studentId),
  });

  return {
    portalTransportSchedules: query.data ?? [],
    portalTransportSchedulesError: query.error,
    portalTransportSchedulesIsLoading: query.isLoading,
    portalTransportSchedulesIsFetching: query.isFetching,
    loadPortalTransportSchedules: query.refetch,
  };
}
