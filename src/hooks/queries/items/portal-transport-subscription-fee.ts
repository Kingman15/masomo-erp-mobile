import api from "@/api/client";
import { show } from "@/api/endpoints/portal-transport-subscription-fee";
import { portalTransportSubscriptionFeeKeys } from "@/utils/query-keys/portal-transport-subscription-fee";
import type {
  TransportSubscriptionFeePaymentStatusFilter,
  TransportSubscriptionFeesSummaryDTO,
} from "@/utils/types/objects/TransportSubscriptionFeesSummaryDTO";
import { useSingletonQuery } from "../use-singleton-query";

interface UsePortalTransportSubscriptionFeesParams {
  studentId: string | null | undefined;
  filters?: {
    schoolClassId?: string | null;
    schoolYearId?: string | null;
    paymentStatus?: TransportSubscriptionFeePaymentStatusFilter | null;
  };
  enabled?: boolean;
}

export function usePortalTransportSubscriptionFees({
  studentId,
  filters = {},
  enabled = true,
}: UsePortalTransportSubscriptionFeesParams) {
  const query = useSingletonQuery<TransportSubscriptionFeesSummaryDTO>({
    queryKey: portalTransportSubscriptionFeeKeys.list(studentId, filters),
    queryFn: () => show(api, studentId!, filters),
    label: "Frais d'abonnement de transport",
    enabled: enabled && Boolean(studentId),
  });

  return {
    portalTransportSubscriptionFees: query.data,
    portalTransportSubscriptionFeesError: query.error,
    portalTransportSubscriptionFeesIsLoading: query.isLoading,
    portalTransportSubscriptionFeesIsFetching: query.isFetching,
    loadPortalTransportSubscriptionFees: query.refetch,
  };
}
