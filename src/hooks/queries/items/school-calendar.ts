import api from "@/api/client";
import { fetchSchoolCalendar } from "@/api/endpoints/schoolCalendar";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { schoolCalendarKeys } from "@/utils/query-keys/school-calendar";
import { SchoolCalendar } from "@/utils/types/SchoolCalendar";
import { useSingletonQuery } from "../use-singleton-query";

export function schoolCalendarQuery(
  schoolYearId: string,
): QueryDefinition<SchoolCalendar> {
  return {
    queryKey: schoolCalendarKeys.detail(schoolYearId),
    queryFn: () => fetchSchoolCalendar(api, schoolYearId),
    label: "Calendrier scolaire",
  };
}

export function useSchoolCalendar({
  schoolYearId,
}: {
  schoolYearId: string | null | undefined;
}) {
  const query = useSingletonQuery<SchoolCalendar>({
    ...schoolCalendarQuery(schoolYearId ?? ""),
    enabled: Boolean(schoolYearId),
    offline: true,
  });

  return {
    schoolCalendar: query.data,
    schoolCalendarError: query.error,
    schoolCalendarIsLoading: query.isLoading,
    schoolCalendarIsFetching: query.isFetching,
    loadSchoolCalendar: query.refetch,
  };
}
