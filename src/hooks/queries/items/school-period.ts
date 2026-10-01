import api from "@/api/client";
import { index } from "@/api/endpoints/schoolPeriod";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { schoolPeriodKeys } from "@/utils/query-keys/school-period";
import { SchoolPeriod } from "@/utils/types/SchoolPeriod";
import { useListQuery } from "../use-list-query";

export function schoolPeriodsQuery(): QueryDefinition<SchoolPeriod[]> {
  return {
    queryKey: schoolPeriodKeys.list(),
    queryFn: () => index(api),
    label: "Périodes scolaires",
  };
}

export function useSchoolPeriods() {
  const query = useListQuery<SchoolPeriod>({
    ...schoolPeriodsQuery(),
    staleTime: Infinity,
    offline: true,
  });

  return {
    schoolPeriods: query.data,
    schoolPeriodsError: query.error,
    schoolPeriodsIsLoading: query.isLoading,
    loadSchoolPeriods: query.refetch,
    schoolPeriodsIsFetching: query.isFetching,
  };
}
