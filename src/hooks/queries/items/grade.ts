import api from "@/api/client";
import { portalIndex } from "@/api/endpoints/grade";
import { portalGradeKeys } from "@/utils/query-keys/portal-grade";
import { PortalGradeDTO } from "@/utils/types/objects/PortalGradeDTO";
import { useListQuery } from "../use-list-query";

interface UsePortalGradesParams {
  studentId?: string | null;
  filters?: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    evaluationPeriodId?: string | null;
    courseId?: string | null;
  };
  enabled?: boolean;
}

export function usePortalGrades({
  studentId,
  filters = {},
  enabled = true,
}: UsePortalGradesParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    schoolClassId: filters.schoolClassId ?? undefined,
    evaluationPeriodId: filters.evaluationPeriodId ?? undefined,
    courseId: filters.courseId ?? undefined,
  };

  const query = useListQuery<PortalGradeDTO>({
    queryKey: portalGradeKeys.list(studentId, normalizedFilters),
    queryFn: () => portalIndex(api, studentId!, normalizedFilters),
    label: "Notes",
    enabled:
      enabled &&
      Boolean(studentId && filters.schoolYearId && filters.schoolClassId),
  });

  return {
    portalGrades: query.data,
    portalGradesError: query.error,
    portalGradesIsLoading: query.isLoading,
    portalGradesIsFetching: query.isFetching,
    loadPortalGrades: query.refetch,
  };
}
