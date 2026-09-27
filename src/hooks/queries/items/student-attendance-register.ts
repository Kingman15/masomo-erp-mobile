import api from "@/api/client";
import { index } from "@/api/endpoints/studentAttendanceRegister";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { studentAttendanceRegisterKeys } from "@/utils/query-keys/student-attendance-register";
import { StudentAttendanceRegister } from "@/utils/types/StudentAttendanceRegister";
import { useListQuery } from "../use-list-query";

interface UseStudentAttendanceRegistersParams {
  filters: {
    schoolYearId?: string | null;
    status?: string | null;
  };
  enabled?: boolean;
}

export function studentAttendanceRegistersQuery(
  filters: UseStudentAttendanceRegistersParams["filters"],
): QueryDefinition<StudentAttendanceRegister[]> {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? null,
    status: filters.status ?? null,
  };

  return {
    queryKey: studentAttendanceRegisterKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Registres de présences",
  };
}

export function useStudentAttendanceRegisters({
  filters,
  enabled = true,
}: UseStudentAttendanceRegistersParams) {
  const query = useListQuery<StudentAttendanceRegister>({
    ...studentAttendanceRegistersQuery(filters),
    enabled,
    offline: true,
  });

  return {
    studentAttendanceRegisters: query.data,
    studentAttendanceRegistersError: query.error,
    studentAttendanceRegistersIsLoading: query.isLoading,
    loadStudentAttendanceRegisters: query.refetch,
    studentAttendanceRegistersIsFetching: query.isFetching,
  };
}
