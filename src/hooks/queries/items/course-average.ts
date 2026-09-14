import api from "@/api/client";
import { portalIndex } from "@/api/endpoints/courseAverage";
import { portalCourseAverageKeys } from "@/utils/query-keys/portal-course-average";
import { CourseAverageDTO } from "@/utils/types/objects/CourseAverageDTO";
import { useListQuery } from "../use-list-query";

interface UsePortalCourseAveragesParams {
  studentId?: string | null;
  filters?: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    evaluationPeriodId?: string | null;
    sysyId?: string | null;
  };
  enabled?: boolean;
}

export function usePortalCourseAverages({
  studentId,
  filters = {},
  enabled = true,
}: UsePortalCourseAveragesParams) {
  const { schoolYearId, schoolClassId, evaluationPeriodId, sysyId } = filters;

  const query = useListQuery<CourseAverageDTO>({
    queryKey: portalCourseAverageKeys.list(studentId, filters),
    queryFn: () =>
      portalIndex(api, {
        studentId: studentId ?? undefined,
        schoolYearId: schoolYearId ?? undefined,
        schoolClassId: schoolClassId ?? undefined,
        evaluationPeriodId: evaluationPeriodId ?? undefined,
        sysyId: sysyId ?? undefined,
      }),
    label: "Moyennes par cours",
    enabled: enabled && Boolean(studentId && schoolYearId && schoolClassId),
  });

  return {
    portalCourseAverages: query.data,
    portalCourseAveragesError: query.error,
    portalCourseAveragesIsLoading: query.isLoading,
    portalCourseAveragesIsFetching: query.isFetching,
    loadPortalCourseAverages: query.refetch,
  };
}
