import api from "@/api/client";
import {
  index,
  portalIndex,
  portalShow,
  show as fetchStudentIncidentById,
  store,
  update,
  type PortalIncidentDetailDTO,
  type StudentIncidentPayload,
} from "@/api/endpoints/studentIncident";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentIncidentSanctionKeys } from "@/utils/query-keys/student-incident-sanction";
import { useOfflineMutation } from "@/lib/offline/use-offline-mutation";
import { studentIncidentKeys } from "@/utils/query-keys/student-incident";
import { portalIncidentKeys } from "@/utils/query-keys/portal-incident";
import { StudentIncident, StudentIncidentStatus } from "@/utils/types/StudentIncident";
import { useDetailQuery } from "../use-detail-query";
import { useInfiniteScrollQuery } from "../use-infinite-scroll-query";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

interface UseStudentIncidentsParams {
  filters: {
    schoolYearId?: string | null;
    incidentTypeId?: string | null;
    status?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    searchTerm?: string | null;
    studentId?: string | null;
    schoolClassId?: string | null;
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
    schoolClassId: filters.schoolClassId ?? undefined,
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

interface UsePortalIncidentsParams {
  studentId?: string | null;
  filters?: {
    schoolYearId?: string | null;
    status?: StudentIncidentStatus | null;
    startDate?: string | null;
    endDate?: string | null;
    schoolClassId?: string | null;
  };
  enabled?: boolean;
}

export function usePortalIncidents({
  studentId,
  filters = {},
  enabled = true,
}: UsePortalIncidentsParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    status: filters.status ?? undefined,
    startDate: filters.startDate ?? undefined,
    endDate: filters.endDate ?? undefined,
    schoolClassId: filters.schoolClassId ?? undefined,
  };

  const query = useListQuery<PortalIncidentDetailDTO["incident"]>({
    queryKey: portalIncidentKeys.list(studentId, filters),
    queryFn: () => portalIndex(api, studentId!, normalizedFilters),
    label: "Incidents",
    enabled: enabled && Boolean(studentId),
  });

  return {
    portalIncidents: query.data,
    portalIncidentsError: query.error,
    portalIncidentsIsLoading: query.isLoading,
    portalIncidentsIsFetching: query.isFetching,
    loadPortalIncidents: query.refetch,
  };
}

interface UsePortalIncidentParams {
  studentId?: string | null;
  incidentId?: string | null;
}

export function usePortalIncident({
  studentId,
  incidentId,
}: UsePortalIncidentParams) {
  const query = useSingletonQuery<PortalIncidentDetailDTO>({
    queryKey: portalIncidentKeys.detail(studentId, incidentId ?? undefined),
    queryFn: () => portalShow(api, studentId!, incidentId!),
    label: "Incident",
    enabled: Boolean(studentId && incidentId),
  });

  return {
    portalIncident: query.data?.incident ?? null,
    portalIncidentSanctions: query.data?.sanctions ?? [],
    portalIncidentIsLoading: query.isLoading,
    portalIncidentError: query.error,
    loadPortalIncident: query.refetch,
  };
}

// Signalement rejouable hors ligne (file offline).
export function useTeacherReportStudentIncident() {
  const { submit, isPending } = useOfflineMutation("incident.teacherReport");

  return {
    teacherReportStudentIncident: submit,
    teacherReportStudentIncidentIsPending: isPending,
  };
}

// Saisie complète en ligne : listes et fiches d'incidents et de sanctions rafraîchies après coup.
function useInvalidateIncidents() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: studentIncidentKeys.all });
    void queryClient.invalidateQueries({
      queryKey: studentIncidentSanctionKeys.all,
    });
  };
}

export function useCreateStudentIncident() {
  const invalidate = useInvalidateIncidents();

  const mutation = useMutation({
    mutationFn: (payload: StudentIncidentPayload) => store(api, payload),
    onSuccess: invalidate,
  });

  return {
    createStudentIncident: mutation.mutateAsync,
    createStudentIncidentIsPending: mutation.isPending,
  };
}

export function useUpdateStudentIncident() {
  const invalidate = useInvalidateIncidents();

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StudentIncidentPayload }) =>
      update(api, id, payload),
    onSuccess: invalidate,
  });

  return {
    updateStudentIncident: mutation.mutateAsync,
    updateStudentIncidentIsPending: mutation.isPending,
  };
}
