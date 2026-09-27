import api from "@/api/client";
import { index } from "@/api/endpoints/studentInternalRegulation";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { studentInternalRegulationKeys } from "@/utils/query-keys/student-internal-regulation";
import { StudentInternalRegulation } from "@/utils/types/StudentInternalRegulation";
import { useListQuery } from "../use-list-query";

interface UseStudentInternalRegulationsParams {
  filters: {
    schoolYearId?: string | null;
    targetType?: string | null;
    targetId?: string | null;
  };
  enabled?: boolean;
}

export function studentInternalRegulationsQuery(
  filters: UseStudentInternalRegulationsParams["filters"],
): QueryDefinition<StudentInternalRegulation[]> {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    targetType: filters.targetType ?? undefined,
    targetId: filters.targetId ?? undefined,
  };

  return {
    queryKey: studentInternalRegulationKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Règlements d'ordre intérieur",
  };
}

export function useStudentInternalRegulations({
  filters,
  enabled = true,
}: UseStudentInternalRegulationsParams) {
  const query = useListQuery<StudentInternalRegulation>({
    ...studentInternalRegulationsQuery(filters),
    enabled: Boolean(filters.schoolYearId) && enabled,
    offline: true,
  });

  return {
    studentInternalRegulations: query.data ?? [],
    studentInternalRegulationsError: query.error,
    studentInternalRegulationsIsLoading: query.isLoading,
    studentInternalRegulationsIsFetching: query.isFetching,
    loadStudentInternalRegulations: query.refetch,
  };
}
