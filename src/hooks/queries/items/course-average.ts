import api from "@/api/client";
import { index, portalIndex } from "@/api/endpoints/courseAverage";
import { courseAverageKeys } from "@/utils/query-keys/course-average";
import { portalCourseAverageKeys } from "@/utils/query-keys/portal-course-average";
import { CourseAverageDTO } from "@/utils/types/objects/CourseAverageDTO";
import { useListQuery } from "../use-list-query";

interface UseCourseAveragesParams {
  filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    schoolPeriodId?: string | null;
    schoolYearTermId?: string | null;
  };
  enabled?: boolean;
}

// Moyennes par cours d'une classe, côté personnel (ramenées à ses cours pour un enseignant).
export function useCourseAverages({
  filters,
  enabled = true,
}: UseCourseAveragesParams) {
  const { schoolYearId, schoolClassId } = filters;

  const query = useListQuery<CourseAverageDTO>({
    queryKey: courseAverageKeys.list(filters),
    queryFn: () =>
      index(api, {
        schoolYearId: schoolYearId!,
        schoolClassId: schoolClassId!,
        schoolPeriodId: filters.schoolPeriodId,
        schoolYearTermId: filters.schoolYearTermId,
      }),
    label: "Moyennes par cours",
    enabled: enabled && Boolean(schoolYearId && schoolClassId),
  });

  return {
    courseAverages: query.data ?? [],
    courseAveragesError: query.error,
    courseAveragesIsLoading: query.isLoading,
    courseAveragesIsFetching: query.isFetching,
    loadCourseAverages: query.refetch,
  };
}

interface UsePortalCourseAveragesParams {
  studentId?: string | null;
  filters?: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    schoolPeriodId?: string | null;
    schoolYearTermId?: string | null;
  };
  enabled?: boolean;
}

export function usePortalCourseAverages({
  studentId,
  filters = {},
  enabled = true,
}: UsePortalCourseAveragesParams) {
  const { schoolYearId, schoolClassId, schoolPeriodId, schoolYearTermId } = filters;

  const query = useListQuery<CourseAverageDTO>({
    queryKey: portalCourseAverageKeys.list(studentId, filters),
    queryFn: () =>
      portalIndex(api, {
        studentId: studentId ?? undefined,
        schoolYearId: schoolYearId ?? undefined,
        schoolClassId: schoolClassId ?? undefined,
        schoolPeriodId: schoolPeriodId ?? undefined,
        schoolYearTermId: schoolYearTermId ?? undefined,
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
