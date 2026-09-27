import api from "@/api/client";
import { index } from "@/api/endpoints/studentAttendanceSession";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { studentAttendanceSessionKeys } from "@/utils/query-keys/student-attendance-session";
import { StudentAttendanceSession } from "@/utils/types/StudentAttendanceSession";
import { useListQuery } from "../use-list-query";

interface UseStudentAttendanceSessionsParams {
  filters: {
    registerId?: string | null;
    status?: string | null;
    shiftId?: string | null;
  };
  enabled?: boolean;
}

export function studentAttendanceSessionsQuery(
  filters: UseStudentAttendanceSessionsParams["filters"],
): QueryDefinition<StudentAttendanceSession[]> {
  const normalizedFilters = {
    registerId: filters.registerId ?? null,
    status: filters.status ?? null,
    shiftId: filters.shiftId ?? null,
  };

  return {
    queryKey: studentAttendanceSessionKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Sessions de présences",
  };
}

export function useStudentAttendanceSessions({
  filters,
  enabled = true,
}: UseStudentAttendanceSessionsParams) {
  const query = useListQuery<StudentAttendanceSession>({
    ...studentAttendanceSessionsQuery(filters),
    enabled,
    offline: true,
  });

  return {
    studentAttendanceSessions: query.data,
    studentAttendanceSessionsError: query.error,
    studentAttendanceSessionsIsLoading: query.isLoading,
    loadStudentAttendanceSessions: query.refetch,
    studentAttendanceSessionsIsFetching: query.isFetching,
  };
}
