import api from "@/api/client";
import {
  destroy,
  index,
  show as fetchStudentAttendanceRecordById,
  store,
  summary,
  update,
  type StudentAttendanceBulkRecordResult,
  type StudentAttendanceRecordPayload,
} from "@/api/endpoints/studentAttendanceRecord";
import { useOfflineMutation } from "@/lib/offline/use-offline-mutation";
import { enrollmentKeys } from "@/utils/query-keys/enrollment";
import { studentAttendanceRecordKeys } from "@/utils/query-keys/student-attendance-record";
import { StudentAttendanceRecord } from "@/utils/types/StudentAttendanceRecord";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

// Les inscriptions sont filtrées par « non encore pointées » : on les invalide aussi.
function useInvalidateStudentAttendanceRecords() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: studentAttendanceRecordKeys.all,
    });
    void queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
  };
}

// Pointage en lot rejouable hors ligne (file offline).
export function useBulkCreateStudentAttendanceRecords() {
  const { submit, isPending } = useOfflineMutation<
    "attendance.bulk",
    StudentAttendanceBulkRecordResult
  >("attendance.bulk");

  return {
    bulkCreateStudentAttendanceRecords: submit,
    bulkCreateStudentAttendanceRecordsIsPending: isPending,
  };
}

export function useCreateStudentAttendanceRecord() {
  const invalidate = useInvalidateStudentAttendanceRecords();

  const mutation = useMutation({
    mutationFn: (payload: StudentAttendanceRecordPayload) =>
      store(api, payload),
    onSuccess: invalidate,
  });

  return {
    createStudentAttendanceRecord: mutation.mutateAsync,
    createStudentAttendanceRecordIsPending: mutation.isPending,
  };
}

export function useUpdateStudentAttendanceRecord(id: string | undefined) {
  const invalidate = useInvalidateStudentAttendanceRecords();

  const mutation = useMutation({
    mutationFn: (payload: StudentAttendanceRecordPayload) => {
      if (!id) return Promise.reject(new Error("No record to update"));
      return update(api, id, payload);
    },
    onSuccess: invalidate,
  });

  return {
    updateStudentAttendanceRecord: mutation.mutateAsync,
    updateStudentAttendanceRecordIsPending: mutation.isPending,
  };
}

export function useDeleteStudentAttendanceRecord() {
  const invalidate = useInvalidateStudentAttendanceRecords();

  const mutation = useMutation({
    mutationFn: (id: string) => destroy(api, id),
    onSuccess: invalidate,
  });

  return {
    deleteStudentAttendanceRecord: mutation.mutateAsync,
    deleteStudentAttendanceRecordIsPending: mutation.isPending,
  };
}
