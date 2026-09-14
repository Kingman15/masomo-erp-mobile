import api from "@/api/client";
import {
  index,
  portalIndex,
  portalShow,
  show as fetchStudentIncidentSanctionById,
  type PortalSanctionDetailDTO,
} from "@/api/endpoints/studentIncidentSanction";
import { studentIncidentSanctionKeys } from "@/utils/query-keys/student-incident-sanction";
import { portalSanctionKeys } from "@/utils/query-keys/portal-sanction";
import { StudentIncidentSanction, StudentIncidentSanctionStatus } from "@/utils/types/StudentIncidentSanction";
import { useDetailQuery } from "../use-detail-query";
import { useInfiniteScrollQuery } from "../use-infinite-scroll-query";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

interface UseStudentIncidentSanctionsParams {
  filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    sanctionTypeId?: string | null;
    incidentTypeId?: string | null;
    status?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  };

  enabled?: boolean;
}

export function useStudentIncidentSanctions({
  filters,
  enabled = true,
}: UseStudentIncidentSanctionsParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    schoolClassId: filters.schoolClassId ?? undefined,
    sanctionTypeId: filters.sanctionTypeId ?? undefined,
    incidentTypeId: filters.incidentTypeId ?? undefined,
    status: filters.status ?? undefined,
    startDate: filters.startDate ?? undefined,
    endDate: filters.endDate ?? undefined,
  };

  const query = useInfiniteScrollQuery<StudentIncidentSanction>({
    queryKey: studentIncidentSanctionKeys.list(normalizedFilters),
    queryFn: (page, perPage) => index(api, normalizedFilters, page, perPage),
    label: "Sanctions",
    enabled: Boolean(filters.schoolYearId) && enabled,
  });

  return {
    studentIncidentSanctions: query.items,
    studentIncidentSanctionsMeta: query.meta,
    studentIncidentSanctionsError: query.error,
    studentIncidentSanctionsIsLoading: query.isLoading,
    studentIncidentSanctionsIsFetching: query.isFetching,
    studentIncidentSanctionsIsFetchingNextPage: query.isFetchingNextPage,
    studentIncidentSanctionsIsRefetching: query.isRefetching,
    studentIncidentSanctionsHasNextPage: query.hasNextPage,
    fetchNextStudentIncidentSanctions: query.fetchNextPage,
    loadStudentIncidentSanctions: query.refetch,
  };
}

export function useStudentIncidentSanctionById(id: string | undefined) {
  const query = useDetailQuery<StudentIncidentSanction>({
    queryKey: studentIncidentSanctionKeys.detail(id),
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error("ID is required"));
      }
      return fetchStudentIncidentSanctionById(api, id);
    },
    label: "Sanction",
    id,
  });

  return {
    studentIncidentSanction: query.data,
    studentIncidentSanctionIsLoading: query.isLoading,
    studentIncidentSanctionError: query.error,
    loadStudentIncidentSanction: query.refetch,
  };
}

interface UsePortalSanctionsParams {
  studentId?: string | null;
  filters?: {
    schoolYearId?: string | null;
    incidentTypeId?: string | null;
    sanctionTypeId?: string | null;
    status?: StudentIncidentSanctionStatus | null;
    startDate?: string | null;
    endDate?: string | null;
    schoolClassId?: string | null;
  };
  enabled?: boolean;
}

export function usePortalSanctions({
  studentId,
  filters = {},
  enabled = true,
}: UsePortalSanctionsParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    incidentTypeId: filters.incidentTypeId ?? undefined,
    sanctionTypeId: filters.sanctionTypeId ?? undefined,
    status: filters.status ?? undefined,
    startDate: filters.startDate ?? undefined,
    endDate: filters.endDate ?? undefined,
    schoolClassId: filters.schoolClassId ?? undefined,
  };

  const query = useListQuery<PortalSanctionDetailDTO["sanction"]>({
    queryKey: portalSanctionKeys.list(studentId, filters),
    queryFn: () => portalIndex(api, studentId!, normalizedFilters),
    label: "Sanctions",
    enabled: enabled && Boolean(studentId),
  });

  return {
    portalSanctions: query.data,
    portalSanctionsError: query.error,
    portalSanctionsIsLoading: query.isLoading,
    portalSanctionsIsFetching: query.isFetching,
    loadPortalSanctions: query.refetch,
  };
}

interface UsePortalSanctionParams {
  studentId?: string | null;
  sanctionId?: string | null;
}

export function usePortalSanction({
  studentId,
  sanctionId,
}: UsePortalSanctionParams) {
  const query = useSingletonQuery<PortalSanctionDetailDTO>({
    queryKey: portalSanctionKeys.detail(studentId, sanctionId ?? undefined),
    queryFn: () => portalShow(api, studentId!, sanctionId!),
    label: "Sanction",
    enabled: Boolean(studentId && sanctionId),
  });

  return {
    portalSanction: query.data?.sanction ?? null,
    portalSanctionIncident: query.data?.incident ?? null,
    portalSanctionIsLoading: query.isLoading,
    portalSanctionError: query.error,
    loadPortalSanction: query.refetch,
  };
}
