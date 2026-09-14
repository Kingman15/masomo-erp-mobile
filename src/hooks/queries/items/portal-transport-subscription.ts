import api from "@/api/client";
import { current, list, show } from "@/api/endpoints/portal-transport-subscription";
import { portalTransportSubscriptionKeys } from "@/utils/query-keys/portal-transport-subscription";
import {
  TransportSubscription,
  TransportSubscriptionStatus,
} from "@/utils/types/TransportSubscription";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

interface UseCurrentTransportSubscriptionParams {
  studentId: string | null | undefined;
  enabled?: boolean;
}

export function useCurrentTransportSubscription({
  studentId,
  enabled = true,
}: UseCurrentTransportSubscriptionParams) {
  const query = useSingletonQuery<TransportSubscription | null>({
    queryKey: portalTransportSubscriptionKeys.current(studentId),
    queryFn: () => current(api, studentId!),
    label: "Abonnement de transport courant",
    enabled: enabled && Boolean(studentId),
  });

  return {
    currentTransportSubscription: query.data,
    currentTransportSubscriptionIsLoading: query.isLoading,
    currentTransportSubscriptionError: query.error,
    loadCurrentTransportSubscription: query.refetch,
  };
}

interface UsePortalTransportSubscriptionsParams {
  studentId: string | null | undefined;
  filters?: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    shiftId?: string | null;
    status?: TransportSubscriptionStatus | null;
  };
  enabled?: boolean;
}

export function usePortalTransportSubscriptions({
  studentId,
  filters = {},
  enabled = true,
}: UsePortalTransportSubscriptionsParams) {
  const query = useListQuery<TransportSubscription>({
    queryKey: portalTransportSubscriptionKeys.list(studentId, filters),
    queryFn: () => list(api, studentId!, filters),
    label: "Abonnements de transport",
    enabled: enabled && Boolean(studentId),
  });

  return {
    portalTransportSubscriptions: query.data ?? [],
    portalTransportSubscriptionsError: query.error,
    portalTransportSubscriptionsIsLoading: query.isLoading,
    portalTransportSubscriptionsIsFetching: query.isFetching,
    loadPortalTransportSubscriptions: query.refetch,
  };
}

interface UsePortalTransportSubscriptionParams {
  studentId: string | null | undefined;
  subscriptionId: string | null | undefined;
}

export function usePortalTransportSubscription({
  studentId,
  subscriptionId,
}: UsePortalTransportSubscriptionParams) {
  const query = useSingletonQuery<TransportSubscription>({
    queryKey: portalTransportSubscriptionKeys.detail(studentId, subscriptionId),
    queryFn: () => show(api, studentId!, subscriptionId!),
    label: "Abonnement de transport",
    enabled: Boolean(studentId && subscriptionId),
  });

  return {
    portalTransportSubscription: query.data,
    portalTransportSubscriptionIsLoading: query.isLoading,
    portalTransportSubscriptionError: query.error,
    loadPortalTransportSubscription: query.refetch,
  };
}
