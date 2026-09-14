import api from "@/api/client";
import {
  index,
  show as fetchStudentAttendanceRecordById,
  summary,
} from "@/api/endpoints/studentAttendanceRecord";
import { studentAttendanceRecordKeys } from "@/utils/query-keys/student-attendance-record";
import { StudentAttendanceRecord } from "@/utils/types/StudentAttendanceRecord";
import { useDetailQuery } from "../use-detail-query";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

interface StudentAttendanceRecordFiltersParam {
  sessionId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  studentId?: string | null;
  schoolYearId?: string | null;
  pointingTypeId?: string | null;
  pointingChannelId?: string | null;
  justificationStatusId?: string | null;
  sectionId?: string | null;
  schoolClassId?: string | null;
}

function normalizeFilters(filters: StudentAttendanceRecordFiltersParam) {
  return {
    sessionId: filters.sessionId ?? undefined,
    startDate: filters.startDate ?? undefined,
    endDate: filters.endDate ?? undefined,
    studentId: filters.studentId ?? undefined,
    schoolYearId: filters.schoolYearId ?? undefined,
    pointingTypeId: filters.pointingTypeId ?? undefined,
    pointingChannelId: filters.pointingChannelId ?? undefined,
    justificationStatusId: filters.justificationStatusId ?? undefined,
    sectionId: filters.sectionId ?? undefined,
    schoolClassId: filters.schoolClassId ?? undefined,
  };
}

interface UseStudentAttendanceRecordsParams {
  filters: StudentAttendanceRecordFiltersParam;
  enabled?: boolean;
}

export function useStudentAttendanceRecords({
  filters,
  enabled = true,
}: UseStudentAttendanceRecordsParams) {
  const normalizedFilters = normalizeFilters(filters);

  const query = useListQuery<StudentAttendanceRecord>({
    queryKey: studentAttendanceRecordKeys.list(filters),
    queryFn: () => index(api, normalizedFilters),
    label: "Pointages de présences",
    enabled,
  });

  return {
    studentAttendanceRecords: query.data,
    studentAttendanceRecordsError: query.error,
    studentAttendanceRecordsIsLoading: query.isLoading,
    loadStudentAttendanceRecords: query.refetch,
    studentAttendanceRecordsIsFetching: query.isFetching,
  };
}

interface UseStudentAttendanceRecordSummaryParams {
  filters: StudentAttendanceRecordFiltersParam;
  enabled?: boolean;
}

export function useStudentAttendanceRecordSummary({
  filters,
  enabled = true,
}: UseStudentAttendanceRecordSummaryParams) {
  const normalizedFilters = normalizeFilters(filters);

  const query = useSingletonQuery({
    queryKey: studentAttendanceRecordKeys.summary(filters),
    queryFn: () => summary(api, normalizedFilters),
    label: "Statistiques de présences",
    enabled,
  });

  return {
    studentAttendanceRecordSummary: query.data,
    studentAttendanceRecordSummaryError: query.error,
    studentAttendanceRecordSummaryIsLoading: query.isLoading,
    loadStudentAttendanceRecordSummary: query.refetch,
    studentAttendanceRecordSummaryIsFetching: query.isFetching,
  };
}

export function useStudentAttendanceRecordById(id: string | undefined) {
  const query = useDetailQuery<StudentAttendanceRecord>({
    queryKey: studentAttendanceRecordKeys.detail(id),
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error("ID is required"));
      }
      return fetchStudentAttendanceRecordById(api, id);
    },
    label: "Pointage de présence",
    id,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  return {
    studentAttendanceRecord: query.data,
    studentAttendanceRecordIsLoading: query.isLoading,
    studentAttendanceRecordError: query.error,
    loadStudentAttendanceRecord: query.refetch,
  };
}
