import api from "@/api/client";
import { portalIndex, portalShow } from "@/api/endpoints/feePaymentDerogation";
import { portalFeePaymentDerogationKeys } from "@/utils/query-keys/portal-fee-payment-derogation";
import type {
  FeePaymentDerogationStatus,
  PortalFeePaymentDerogationDTO,
} from "@/utils/types/objects/PortalFeePaymentDerogationDTO";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

interface UsePortalFeePaymentDerogationsParams {
  studentId?: string | null;
  filters?: {
    schoolClassId?: string | null;
    schoolYearId?: string | null;
    status?: FeePaymentDerogationStatus | null;
    inProgress?: boolean | null;
  };
  enabled?: boolean;
}

export function usePortalFeePaymentDerogations({
  studentId,
  filters = {},
  enabled = true,
}: UsePortalFeePaymentDerogationsParams) {
  const normalizedFilters = {
    schoolClassId: filters.schoolClassId ?? undefined,
    schoolYearId: filters.schoolYearId ?? undefined,
    status: filters.status ?? undefined,
    inProgress: filters.inProgress ?? undefined,
  };

  const query = useListQuery<PortalFeePaymentDerogationDTO>({
    queryKey: portalFeePaymentDerogationKeys.list(studentId, filters),
    queryFn: () => portalIndex(api, studentId!, normalizedFilters),
    label: "Dérogations de paiement de frais",
    enabled:
      enabled && Boolean(studentId && filters.schoolClassId && filters.schoolYearId),
  });

  return {
    portalFeePaymentDerogations: query.data ?? [],
    portalFeePaymentDerogationsError: query.error,
    portalFeePaymentDerogationsIsLoading: query.isLoading,
    portalFeePaymentDerogationsIsFetching: query.isFetching,
    loadPortalFeePaymentDerogations: query.refetch,
  };
}

interface UsePortalFeePaymentDerogationParams {
  studentId?: string | null;
  feePaymentDerogationId?: string | null;
}

export function usePortalFeePaymentDerogation({
  studentId,
  feePaymentDerogationId,
}: UsePortalFeePaymentDerogationParams) {
  const query = useSingletonQuery<PortalFeePaymentDerogationDTO>({
    queryKey: portalFeePaymentDerogationKeys.detail(
      studentId,
      feePaymentDerogationId ?? undefined,
    ),
    queryFn: () => portalShow(api, studentId!, feePaymentDerogationId!),
    label: "Dérogation de paiement de frais",
    enabled: Boolean(studentId && feePaymentDerogationId),
  });

  return {
    portalFeePaymentDerogation: query.data,
    portalFeePaymentDerogationIsLoading: query.isLoading,
    portalFeePaymentDerogationError: query.error,
    loadPortalFeePaymentDerogation: query.refetch,
  };
}
