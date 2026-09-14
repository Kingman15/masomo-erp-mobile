import api from "@/api/client";
import { getHousehold, getStudentSummary, getStudentToday } from "@/api/endpoints/portalDashboard";
import { portalDashboardKeys } from "@/utils/query-keys/portal-dashboard";
import { PortalDashboardToday } from "@/utils/types/PortalDashboardToday";
import { PortalHouseholdResponse } from "@/utils/types/PortalHousehold";
import { StudentDashboardSummaryResponse } from "@/utils/types/PortalStudentDashboard";
import { useSingletonQuery } from "../use-singleton-query";

export function usePortalHousehold() {
  const query = useSingletonQuery<PortalHouseholdResponse>({
    queryKey: portalDashboardKeys.household(),
    queryFn: () => getHousehold(api),
    label: "Sommaire foyer",
  });

  return {
    household: query.data?.data ?? [],
    householdMeta: query.data?.meta,
    householdError: query.error,
    householdIsLoading: query.isLoading,
    householdIsFetching: query.isFetching,
    loadHousehold: query.refetch,
  };
}

interface UsePortalStudentSummaryParams {
  studentId?: string | null;
  schoolYearId?: string | null;
  enabled?: boolean;
}

export function usePortalStudentSummary({
  studentId,
  schoolYearId,
  enabled = true,
}: UsePortalStudentSummaryParams) {
  const query = useSingletonQuery<StudentDashboardSummaryResponse>({
    queryKey: portalDashboardKeys.studentSummary(studentId, schoolYearId),
    queryFn: () =>
      getStudentSummary(api, {
        studentId: studentId as string,
        schoolYearId: schoolYearId as string,
      }),
    label: "Sommaire élève",
    enabled: enabled && !!studentId && !!schoolYearId,
  });

  return {
    studentSummary: query.data?.data,
    studentSummaryError: query.error,
    studentSummaryIsLoading: query.isLoading,
    loadStudentSummary: query.refetch,
  };
}

interface UsePortalStudentTodayParams {
  studentId?: string | null;
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  enabled?: boolean;
}

export function usePortalStudentToday({
  studentId,
  schoolYearId,
  schoolClassId,
  enabled = true,
}: UsePortalStudentTodayParams) {
  const query = useSingletonQuery<PortalDashboardToday>({
    queryKey: portalDashboardKeys.studentToday(studentId, schoolYearId, schoolClassId),
    queryFn: () =>
      getStudentToday(api, {
        studentId: studentId as string,
        schoolYearId: schoolYearId as string,
        schoolClassId: schoolClassId as string,
      }),
    label: "Journée élève",
    enabled: enabled && !!studentId && !!schoolYearId && !!schoolClassId,
  });

  return {
    studentToday: query.data,
    studentTodayError: query.error,
    studentTodayIsLoading: query.isLoading,
    loadStudentToday: query.refetch,
  };
}
