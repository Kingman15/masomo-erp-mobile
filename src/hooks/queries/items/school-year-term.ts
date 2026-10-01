import api from "@/api/client";
import { index } from "@/api/endpoints/schoolYearTerm";
import { schoolYearTermKeys } from "@/utils/query-keys/school-year-term";
import { SchoolYearTerm } from "@/utils/types/SchoolYearTerm";
import { useListQuery } from "../use-list-query";

interface UseSchoolYearTermsParams {
  filters: {
    schoolYearId?: string | null;
  };
  enabled?: boolean;
}

export function useSchoolYearTerms({
  filters,
  enabled = true,
}: UseSchoolYearTermsParams) {
  const { schoolYearId } = filters;

  const query = useListQuery<SchoolYearTerm>({
    queryKey: schoolYearTermKeys.list(filters),
    queryFn: () => index(api, { schoolYearId }),
    label: "Année scolaire, subdivisions",
    enabled,
  });

  return {
    schoolYearTerms: query.data,
    schoolYearTermsError: query.error,
    schoolYearTermsIsLoading: query.isLoading,
    schoolYearTermsIsFetching: query.isFetching,
    loadSchoolYearTerms: query.refetch,
  };
}
