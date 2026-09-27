import api from "@/api/client";
import {
  index,
  show as fetchSchoolClassById,
} from "@/api/endpoints/schoolClass";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { schoolClassKeys } from "@/utils/query-keys/school-class";
import { SchoolClass } from "@/utils/types/SchoolClass";
import { useDetailQuery } from "../use-detail-query";
import { useListQuery } from "../use-list-query";

interface UseSchoolClassesParams {
  filters?: {
    sectionId?: string | null;
    optionId?: string | null;
    cycleId?: string | null;
    generalClassId?: string | null;
    excludeByStudentAttendanceSessionId?: string | null;
    teacherId?: string | null;
    schoolYearId?: string | null;
    studentId?: string | null;
    // teacherId désigne alors le titulaire de la classe (pointage).
    homeroom?: boolean | null;
  };
  enabled?: boolean;
}

export function schoolClassesQuery(
  filters: UseSchoolClassesParams["filters"] = {},
): QueryDefinition<SchoolClass[]> {
  const normalizedFilters = {
    sectionId: filters.sectionId ?? null,
    optionId: filters.optionId ?? null,
    cycleId: filters.cycleId ?? null,
    generalClassId: filters.generalClassId ?? null,
    excludeByStudentAttendanceSessionId:
      filters.excludeByStudentAttendanceSessionId ?? null,
    teacherId: filters.teacherId ?? null,
    schoolYearId: filters.schoolYearId ?? null,
    studentId: filters.studentId ?? null,
    homeroom: filters.homeroom ?? null,
  };

  return {
    queryKey: schoolClassKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Classes scolaires",
  };
}

export function useSchoolClasses({
  filters = {},
  enabled,
}: UseSchoolClassesParams = {}) {
  const query = useListQuery<SchoolClass>({
    ...schoolClassesQuery(filters),
    staleTime: Infinity,
    enabled,
    offline: true,
  });

  return {
    schoolClasses: query.data,
    schoolClassesError: query.error,
    schoolClassesIsLoading: query.isLoading,
    loadSchoolClasses: query.refetch,
    schoolClassesIsFetching: query.isFetching,
  };
}

export function useSchoolClassById(id: string | undefined) {
  const query = useDetailQuery<SchoolClass>({
    queryKey: schoolClassKeys.detail(id),
    queryFn: () => {
      if (!id) return Promise.reject(new Error("ID is required"));
      return fetchSchoolClassById(api, id);
    },
    label: "Classe effective",
    id,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  return {
    schoolClass: query.data,
    schoolClassIsLoading: query.isLoading,
    schoolClassError: query.error,
    loadSchoolClass: query.refetch,
  };
}
