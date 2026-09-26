import api from "@/api/client";
import { index } from "@/api/endpoints/studentAttendanceSession";
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

export function useStudentAttendanceSessions({
  filters,
  enabled = true,
}: UseStudentAttendanceSessionsParams) {
  const normalizedFilters = {
    registerId: filters.registerId ?? null,
    status: filters.status ?? null,
    shiftId: filters.shiftId ?? null,
  };

  const query = useListQuery<StudentAttendanceSession>({
    queryKey: studentAttendanceSessionKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Sessions de présences",
    enabled,
  });

  return {
    studentAttendanceSessions: query.data,
    studentAttendanceSessionsError: query.error,
    studentAttendanceSessionsIsLoading: query.isLoading,
    loadStudentAttendanceSessions: query.refetch,
    studentAttendanceSessionsIsFetching: query.isFetching,
  };
}
