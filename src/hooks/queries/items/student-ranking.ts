import api from "@/api/client";
import { portalIndex } from "@/api/endpoints/studentRanking";
import { portalStudentRankingKeys } from "@/utils/query-keys/portal-student-ranking";
import { PortalStudentRankingResultDTO } from "@/utils/types/objects/PortalStudentRankingDTO";
import { useSingletonQuery } from "../use-singleton-query";

interface UsePortalStudentRankingsParams {
  studentId?: string | null;
  filters?: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    schoolPeriodId?: string | null;
    schoolYearTermId?: string | null;
  };
  enabled?: boolean;
}

export function usePortalStudentRankings({
  studentId,
  filters = {},
  enabled = true,
}: UsePortalStudentRankingsParams) {
  const { schoolYearId, schoolClassId, schoolPeriodId, schoolYearTermId } = filters;

  const query = useSingletonQuery<PortalStudentRankingResultDTO>({
    queryKey: portalStudentRankingKeys.list(studentId, filters),
    queryFn: () =>
      portalIndex(api, {
        studentId: studentId ?? undefined,
        schoolYearId: schoolYearId ?? undefined,
        schoolClassId: schoolClassId ?? undefined,
        schoolPeriodId: schoolPeriodId ?? undefined,
        schoolYearTermId: schoolYearTermId ?? undefined,
      }),
    label: "Palmarès scolaire",
    enabled: enabled && Boolean(studentId && schoolClassId && schoolYearId),
  });

  return {
    portalStudentRanking: query.data,
    portalStudentRankingError: query.error,
    portalStudentRankingIsLoading: query.isLoading,
    portalStudentRankingIsFetching: query.isFetching,
    loadPortalStudentRanking: query.refetch,
  };
}
