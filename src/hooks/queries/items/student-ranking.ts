import api from "@/api/client";
import { index, portalIndex } from "@/api/endpoints/studentRanking";
import { portalStudentRankingKeys } from "@/utils/query-keys/portal-student-ranking";
import { studentRankingKeys } from "@/utils/query-keys/student-ranking";
import { PortalStudentRankingResultDTO } from "@/utils/types/objects/PortalStudentRankingDTO";
import { StudentRankingDTO } from "@/utils/types/objects/StudentRankingDTO";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

interface UseStudentRankingsParams {
  filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    schoolPeriodId?: string | null;
    schoolYearTermId?: string | null;
  };
  enabled?: boolean;
}

// Palmarès d'une classe, côté personnel (titulaire).
export function useStudentRankings({
  filters,
  enabled = true,
}: UseStudentRankingsParams) {
  const { schoolYearId, schoolClassId } = filters;

  const query = useListQuery<StudentRankingDTO>({
    queryKey: studentRankingKeys.list(filters),
    queryFn: () =>
      index(api, {
        schoolYearId: schoolYearId!,
        schoolClassId: schoolClassId!,
        schoolPeriodId: filters.schoolPeriodId,
        schoolYearTermId: filters.schoolYearTermId,
      }),
    label: "Palmarès",
    enabled: enabled && Boolean(schoolYearId && schoolClassId),
  });

  return {
    studentRankings: query.data ?? [],
    studentRankingsError: query.error,
    studentRankingsIsLoading: query.isLoading,
    studentRankingsIsFetching: query.isFetching,
    loadStudentRankings: query.refetch,
  };
}

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
