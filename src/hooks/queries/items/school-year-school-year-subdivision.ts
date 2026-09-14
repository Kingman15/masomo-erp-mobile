import api from "@/api/client";
import { index } from "@/api/endpoints/schoolYearSchoolYearSubdivision";
import { schoolYearSchoolYearSubdivisionKeys } from "@/utils/query-keys/school-year-school-year-subdivision";
import { SchoolYearSchoolYearSubdivision } from "@/utils/types/SchoolYearSchoolYearSubdivision";
import { useListQuery } from "../use-list-query";

interface UseSchoolYearSchoolYearSubdivisionsParams {
  filters: {
    schoolYearId?: string | null;
  };
  enabled?: boolean;
}

export function useSchoolYearSchoolYearSubdivisions({
  filters,
  enabled = true,
}: UseSchoolYearSchoolYearSubdivisionsParams) {
  const { schoolYearId } = filters;

  const query = useListQuery<SchoolYearSchoolYearSubdivision>({
    queryKey: schoolYearSchoolYearSubdivisionKeys.list(filters),
    queryFn: () => index(api, { schoolYearId }),
    label: "Année scolaire, subdivisions",
    enabled,
  });

  return {
    schoolYearSchoolYearSubdivisions: query.data,
    schoolYearSchoolYearSubdivisionsError: query.error,
    schoolYearSchoolYearSubdivisionsIsLoading: query.isLoading,
    schoolYearSchoolYearSubdivisionsIsFetching: query.isFetching,
    loadSchoolYearSchoolYearSubdivisions: query.refetch,
  };
}
