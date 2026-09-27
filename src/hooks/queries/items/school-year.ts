import api from "@/api/client";
import {
  current,
  index,
  show as fetchSchoolYearById,
} from "@/api/endpoints/schoolYear";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { schoolYearKeys } from "@/utils/query-keys/school-year";
import { SchoolYear } from "@/utils/types/SchoolYear";
import { useDetailQuery } from "../use-detail-query";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

interface UseSchoolYearsParams {
  filters?: {
    studentId?: string;
  };
  enabled?: boolean;
}

interface UseCurrentSchoolYearParams {
  enabled?: boolean;
}

export function schoolYearsQuery(
  filters: UseSchoolYearsParams["filters"] = {},
): QueryDefinition<SchoolYear[]> {
  const normalizedFilters = { studentId: filters.studentId ?? null };

  return {
    queryKey: schoolYearKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Années scolaires",
  };
}

export function currentSchoolYearQuery(): QueryDefinition<SchoolYear | null> {
  return {
    queryKey: schoolYearKeys.current(),
    queryFn: () => current(api),
    label: "Année scolaire en cours",
  };
}

export function useSchoolYears({
  filters = {},
  enabled = true,
}: UseSchoolYearsParams = {}) {
  const query = useListQuery<SchoolYear>({
    ...schoolYearsQuery(filters),
    staleTime: Infinity,
    enabled,
    offline: true,
  });

  return {
    schoolYears: query.data,
    schoolYearsError: query.error,
    schoolYearsIsLoading: query.isLoading,
    loadSchoolYears: query.refetch,
    schoolYearsIsFetching: query.isFetching,
  };
}

export function useCurrentSchoolYear({
  enabled = true,
}: UseCurrentSchoolYearParams = {}) {
  const query = useSingletonQuery<SchoolYear | null>({
    ...currentSchoolYearQuery(),
    staleTime: Infinity,
    enabled,
    offline: true,
  });

  return {
    currentSchoolYear: query.data,
    currentSchoolYearError: query.error,
    loadCurrentSchoolYear: query.refetch,
    currentSchoolYearIsLoading: query.isLoading,
    currentSchoolYearIsFetching: query.isFetching,
  };
}

export function useSchoolYearById(id: string | undefined) {
  const query = useDetailQuery<SchoolYear>({
    queryKey: schoolYearKeys.detail(id),
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error("ID is required"));
      }
      return fetchSchoolYearById(api, id);
    },
    label: "Année scolaire",
    id,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  return {
    schoolYear: query.data,
    schoolYearIsLoading: query.isLoading,
    schoolYearError: query.error,
  };
}
