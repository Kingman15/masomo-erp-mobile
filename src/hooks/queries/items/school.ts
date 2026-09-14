import api from "@/api/client";
import { current } from "@/api/endpoints/school";
import { schoolKeys } from "@/utils/query-keys/school";
import { School } from "@/utils/types/School";
import { useSingletonQuery } from "../use-singleton-query";

interface UseCurrentSchoolParams {
  enabled?: boolean;
}

export function useCurrentSchool({
  enabled = true,
}: UseCurrentSchoolParams = {}) {
  const query = useSingletonQuery<School | null>({
    queryKey: schoolKeys.current(),
    queryFn: () => current(api),
    label: "Établissement scolaire",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled,
  });

  return {
    currentSchool: query.data,
    currentSchoolError: query.error,
    loadCurrentSchool: query.refetch,
    currentSchoolIsLoading: query.isLoading,
    currentSchoolIsFetching: query.isFetching,
  };
}
