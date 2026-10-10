import api from "@/api/client";
import {
  collectionAvailableFees,
  collectionList,
  derogations,
  feeSchedule,
  feeScheduleSummary,
  index,
  portalIndex,
  portalShow,
  show,
} from "@/api/endpoints/feePayment";
import type { FeePayment, FeePaymentDerogation } from "@/utils/types/FeePayment";
import type {
  FeeCollectionAvailableFeeDTO,
  FeeCollectionListDTO,
} from "@/utils/types/objects/FeeCollectionListDTO";
import { useDetailQuery } from "../use-detail-query";
import { feePaymentKeys } from "@/utils/query-keys/fee-payment";
import { portalFeePaymentKeys } from "@/utils/query-keys/portal-fee-payment";
import type {
  FeeScheduleDTO,
  FeeScheduleSortBy,
  FeeScheduleStatus,
} from "@/utils/types/objects/FeeScheduleDTO";
import type { FeeScheduleSummaryDTO } from "@/utils/types/objects/FeeScheduleSummaryDTO";
import type { PortalFeePaymentDTO } from "@/utils/types/objects/PortalFeePaymentDTO";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

interface UseFeeSchedulesParams {
  filters: {
    studentId?: string | null;
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    status?: FeeScheduleStatus[] | null;
    sortBy?: FeeScheduleSortBy | null;
  };
  enabled?: boolean;
}

export function useFeeSchedules({ filters, enabled = true }: UseFeeSchedulesParams) {
  const normalizedFilters = {
    studentId: filters.studentId ?? undefined,
    schoolYearId: filters.schoolYearId ?? undefined,
    schoolClassId: filters.schoolClassId ?? undefined,
    status: filters.status ?? undefined,
    sortBy: filters.sortBy ?? undefined,
  };

  const query = useListQuery<FeeScheduleDTO>({
    queryKey: feePaymentKeys.feeSchedule(filters),
    queryFn: () => feeSchedule(api, normalizedFilters),
    label: "Échéances de frais",
    enabled: Boolean(filters.studentId && filters.schoolYearId && filters.schoolClassId) && enabled,
  });

  return {
    feeSchedules: query.data ?? [],
    feeSchedulesError: query.error,
    feeSchedulesIsLoading: query.isLoading,
    feeSchedulesIsFetching: query.isFetching,
    loadFeeSchedules: query.refetch,
  };
}

interface UseFeeScheduleSummaryParams {
  filters: {
    studentId?: string | null;
    schoolYearId?: string | null;
    schoolClassId?: string | null;
  };
  enabled?: boolean;
}

export function useFeeScheduleSummary({ filters, enabled = true }: UseFeeScheduleSummaryParams) {
  const query = useSingletonQuery<FeeScheduleSummaryDTO>({
    queryKey: feePaymentKeys.feeScheduleSummary(filters),
    queryFn: () =>
      feeScheduleSummary(api, {
        studentId: filters.studentId ?? undefined,
        schoolYearId: filters.schoolYearId ?? undefined,
        schoolClassId: filters.schoolClassId ?? undefined,
      }),
    label: "Résumé des frais",
    enabled: Boolean(filters.studentId && filters.schoolYearId && filters.schoolClassId) && enabled,
  });

  return {
    feeScheduleSummary: query.data,
    feeScheduleSummaryError: query.error,
    feeScheduleSummaryIsLoading: query.isLoading,
    feeScheduleSummaryIsFetching: query.isFetching,
    loadFeeScheduleSummary: query.refetch,
  };
}

interface UsePortalFeePaymentsParams {
  studentId?: string | null;
  filters?: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
  };
  enabled?: boolean;
}

export function usePortalFeePayments({
  studentId,
  filters = {},
  enabled = true,
}: UsePortalFeePaymentsParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    schoolClassId: filters.schoolClassId ?? undefined,
  };

  const query = useListQuery<PortalFeePaymentDTO>({
    queryKey: portalFeePaymentKeys.list(studentId, filters),
    queryFn: () => portalIndex(api, studentId!, normalizedFilters),
    label: "Paiements de frais",
    enabled: enabled && Boolean(studentId),
  });

  return {
    portalFeePayments: query.data ?? [],
    portalFeePaymentsError: query.error,
    portalFeePaymentsIsLoading: query.isLoading,
    portalFeePaymentsIsFetching: query.isFetching,
    loadPortalFeePayments: query.refetch,
  };
}

interface UsePortalFeePaymentParams {
  studentId?: string | null;
  feePaymentId?: string | null;
}

export function usePortalFeePayment({
  studentId,
  feePaymentId,
}: UsePortalFeePaymentParams) {
  const query = useSingletonQuery<PortalFeePaymentDTO>({
    queryKey: portalFeePaymentKeys.detail(studentId, feePaymentId ?? undefined),
    queryFn: () => portalShow(api, studentId!, feePaymentId!),
    label: "Paiement de frais",
    enabled: Boolean(studentId && feePaymentId),
  });

  return {
    portalFeePayment: query.data,
    portalFeePaymentIsLoading: query.isLoading,
    portalFeePaymentError: query.error,
    loadPortalFeePayment: query.refetch,
  };
}

// --- Consultation du personnel ---

export function useEnrollmentFeePayments({
  enrollmentId,
  enabled = true,
}: {
  enrollmentId: string | null | undefined;
  enabled?: boolean;
}) {
  const query = useListQuery<FeePayment>({
    queryKey: feePaymentKeys.byEnrollment(enrollmentId),
    queryFn: () => index(api, { enrollmentId }),
    label: "Paiements de l'élève",
    enabled: Boolean(enrollmentId) && enabled,
  });

  return {
    feePayments: query.data,
    feePaymentsError: query.error,
    feePaymentsIsLoading: query.isLoading,
  };
}

export function useFeePaymentById(id: string | undefined) {
  const query = useDetailQuery<FeePayment>({
    queryKey: feePaymentKeys.detail(id),
    queryFn: () => {
      if (!id) return Promise.reject(new Error("ID is required"));
      return show(api, id);
    },
    label: "Paiement",
    id,
  });

  return {
    feePayment: query.data,
    feePaymentIsLoading: query.isLoading,
    feePaymentError: query.error,
    loadFeePayment: query.refetch,
  };
}

export function useEnrollmentDerogations({
  enrollmentId,
  schoolYearId,
  enabled = true,
}: {
  enrollmentId: string | null | undefined;
  schoolYearId: string | null | undefined;
  enabled?: boolean;
}) {
  const query = useListQuery<FeePaymentDerogation>({
    queryKey: feePaymentKeys.derogations(enrollmentId),
    queryFn: () =>
      derogations(api, {
        enrollmentId: enrollmentId as string,
        schoolYearId: schoolYearId as string,
      }),
    label: "Dérogations de l'élève",
    enabled: Boolean(enrollmentId && schoolYearId) && enabled,
  });

  return {
    derogations: query.data,
    derogationsIsLoading: query.isLoading,
  };
}

export function useFeeCollectionAvailableFees({
  schoolYearId,
  schoolClassId,
}: {
  schoolYearId: string | null | undefined;
  schoolClassId: string | null | undefined;
}) {
  const query = useListQuery<FeeCollectionAvailableFeeDTO>({
    queryKey: feePaymentKeys.collectionFees(schoolYearId, schoolClassId),
    queryFn: () =>
      collectionAvailableFees(api, {
        schoolYearId: schoolYearId as string,
        schoolClassId: schoolClassId as string,
      }),
    label: "Frais de la classe",
    enabled: Boolean(schoolYearId && schoolClassId),
  });

  return {
    availableFees: query.data,
    availableFeesIsLoading: query.isLoading,
  };
}

export function useFeeCollectionList({
  schoolYearId,
  schoolClassId,
  feeIds,
}: {
  schoolYearId: string | null | undefined;
  schoolClassId: string | null | undefined;
  feeIds: string[];
}) {
  const query = useSingletonQuery<FeeCollectionListDTO>({
    queryKey: feePaymentKeys.collectionList({ schoolYearId, schoolClassId, feeIds }),
    queryFn: () =>
      collectionList(api, {
        schoolYearId: schoolYearId as string,
        schoolClassId: schoolClassId as string,
        feeIds,
      }),
    label: "Contrôle des frais",
    enabled: Boolean(schoolYearId && schoolClassId && feeIds.length > 0),
  });

  return {
    collection: query.data,
    collectionError: query.error,
    collectionIsLoading: query.isLoading,
    collectionIsRefetching: query.isRefetching,
    loadCollection: query.refetch,
  };
}
