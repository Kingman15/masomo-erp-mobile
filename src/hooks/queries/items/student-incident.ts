import api from "@/api/client";
import {
  index,
  show as fetchStudentIncidentById,
  teacherReport,
  type TeacherReportStudentIncidentPayload,
} from "@/api/endpoints/studentIncident";
import { studentIncidentKeys } from "@/utils/query-keys/student-incident";
import { StudentIncident } from "@/utils/types/StudentIncident";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDetailQuery } from "../use-detail-query";
import { useInfiniteScrollQuery } from "../use-infinite-scroll-query";

interface UseStudentIncidentsParams {
  filters: {
    schoolYearId?: string | null;
    incidentTypeId?: string | null;
    status?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    searchTerm?: string | null;
    studentId?: string | null;
  };

  enabled?: boolean;
}

export function useStudentIncidents({
  filters,
  enabled = true,
}: UseStudentIncidentsParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    incidentTypeId: filters.incidentTypeId ?? undefined,
    status: filters.status ?? undefined,
    startDate: filters.startDate ?? undefined,
    endDate: filters.endDate ?? undefined,
    searchTerm: filters.searchTerm ?? undefined,
    studentId: filters.studentId ?? undefined,
  };

  const query = useInfiniteScrollQuery<StudentIncident>({
    queryKey: studentIncidentKeys.list(normalizedFilters),
    queryFn: (page, perPage) => index(api, normalizedFilters, page, perPage),
    label: "Incidents",
    enabled: Boolean(filters.schoolYearId) && enabled,
  });

  return {
    studentIncidents: query.items,
    studentIncidentsMeta: query.meta,
    studentIncidentsError: query.error,
    studentIncidentsIsLoading: query.isLoading,
    studentIncidentsIsFetching: query.isFetching,
    studentIncidentsIsFetchingNextPage: query.isFetchingNextPage,
    studentIncidentsIsRefetching: query.isRefetching,
    studentIncidentsHasNextPage: query.hasNextPage,
    fetchNextStudentIncidents: query.fetchNextPage,
    loadStudentIncidents: query.refetch,
  };
}

export function useStudentIncidentById(id: string | undefined) {
  const query = useDetailQuery<StudentIncident>({
    queryKey: studentIncidentKeys.detail(id),
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error("ID is required"));
      }
      return fetchStudentIncidentById(api, id);
    },
    label: "Incident",
    id,
  });

  return {
    studentIncident: query.data,
    studentIncidentIsLoading: query.isLoading,
    studentIncidentError: query.error,
    loadStudentIncident: query.refetch,
  };
}

export function useTeacherReportStudentIncident() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: TeacherReportStudentIncidentPayload) =>
      teacherReport(api, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studentIncidentKeys.all });
    },
  });

  return {
    teacherReportStudentIncident: mutation.mutateAsync,
    teacherReportStudentIncidentIsPending: mutation.isPending,
  };
}
