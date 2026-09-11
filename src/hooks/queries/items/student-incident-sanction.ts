import api from "@/api/client";
import {
  index,
  show as fetchStudentIncidentSanctionById,
} from "@/api/endpoints/studentIncidentSanction";
import { studentIncidentSanctionKeys } from "@/utils/query-keys/student-incident-sanction";
import { StudentIncidentSanction } from "@/utils/types/StudentIncidentSanction";
import { useDetailQuery } from "../use-detail-query";
import { useInfiniteScrollQuery } from "../use-infinite-scroll-query";

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
