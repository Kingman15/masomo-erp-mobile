import api from "@/api/client";
import {
  currentEnrollments,
  index,
  reportCard,
  show,
} from "@/api/endpoints/enrollment";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { enrollmentKeys } from "@/utils/query-keys/enrollment";
import { Enrollment } from "@/utils/types/Enrollment";
import { StudentReportCardDTO } from "@/utils/types/objects/StudentReportCardDTO";
import { useDetailQuery } from "../use-detail-query";
import { useInfiniteScrollQuery } from "../use-infinite-scroll-query";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

interface UseEnrollmentsParams {
  filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    sortBy?: string | null;
    sortDirection?: "asc" | "desc" | null;
    withoutAttendanceSessionId?: string | null;
  };
  enabled?: boolean;
}

export function enrollmentsQuery(
  filters: UseEnrollmentsParams["filters"],
): QueryDefinition<Enrollment[]> {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? null,
    schoolClassId: filters.schoolClassId ?? null,
    sortBy: filters.sortBy ?? null,
    sortDirection: filters.sortDirection ?? null,
    withoutAttendanceSessionId: filters.withoutAttendanceSessionId ?? null,
  };

  return {
    queryKey: enrollmentKeys.list(normalizedFilters),
    queryFn: () =>
      index(api, normalizedFilters, 1, "all").then((response) => response.data),
    label: "Inscriptions",
  };
}

// Liste complète (perPage = "all"), comme le pointage de présences du web.
export function useEnrollments({
  filters,
  enabled = true,
}: UseEnrollmentsParams) {
  const query = useListQuery<Enrollment>({
    ...enrollmentsQuery(filters),
    enabled,
    // Seule la liste complète d'une classe est gardée hors ligne : celle filtrée par session change à chaque pointage.
    offline: !filters.withoutAttendanceSessionId,
  });

  return {
    enrollments: query.data,
    enrollmentsError: query.error,
    enrollmentsIsLoading: query.isLoading,
    loadEnrollments: query.refetch,
    enrollmentsIsFetching: query.isFetching,
  };
}

interface UseCurrentEnrollmentsParams {
  filters?: {
    schoolYearId?: string | null;
  };
  enabled?: boolean;
}

export function useCurrentEnrollments({
  filters = {},
  enabled = true,
}: UseCurrentEnrollmentsParams = {}) {
  const normalizedFilters = { schoolYearId: filters.schoolYearId ?? null };

  const query = useListQuery<Enrollment>({
    queryKey: enrollmentKeys.currentEnrollments(normalizedFilters),
    queryFn: () => currentEnrollments(api, normalizedFilters),
    label: "Inscriptions courantes",
    enabled,
  });

  return {
    enrollments: query.data,
    enrollmentsError: query.error,
    enrollmentsIsLoading: query.isLoading,
    loadEnrollments: query.refetch,
  };
}

// Bulletin d'un élève : en ligne uniquement (pas de cache hors ligne, les notes et la décision évoluent).
export function useEnrollmentReportCard(enrollmentId: string | null | undefined) {
  const query = useSingletonQuery<StudentReportCardDTO>({
    queryKey: enrollmentKeys.reportCard(enrollmentId),
    queryFn: () => reportCard(api, enrollmentId!),
    label: "Bulletin",
    enabled: Boolean(enrollmentId),
  });

  return {
    reportCard: query.data,
    reportCardError: query.error,
    reportCardIsLoading: query.isLoading,
    reportCardIsFetching: query.isFetching,
    loadReportCard: query.refetch,
  };
}

interface UseEnrollmentPagesParams {
  filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    searchTerm?: string | null;
  };
}

// Écran Élèves : liste paginée (défilement infini), triée par nom d'élève.
export function useEnrollmentPages({ filters }: UseEnrollmentPagesParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? null,
    schoolClassId: filters.schoolClassId ?? null,
    searchTerm: filters.searchTerm || null,
  };

  const query = useInfiniteScrollQuery<Enrollment>({
    queryKey: enrollmentKeys.pages(normalizedFilters),
    queryFn: (page, perPage) =>
      index(
        api,
        { ...normalizedFilters, sortBy: "student_name", sortDirection: "asc" },
        page,
        perPage,
      ),
    label: "Élèves",
    enabled: Boolean(normalizedFilters.schoolYearId),
  });

  return {
    enrollments: query.items,
    enrollmentsMeta: query.meta,
    enrollmentsError: query.error,
    enrollmentsIsLoading: query.isLoading,
    enrollmentsIsFetchingNextPage: query.isFetchingNextPage,
    enrollmentsIsRefetching: query.isRefetching,
    enrollmentsHasNextPage: query.hasNextPage,
    fetchNextEnrollments: query.fetchNextPage,
    loadEnrollments: query.refetch,
  };
}

export function useEnrollmentById(id: string | undefined) {
  const query = useDetailQuery<Enrollment>({
    queryKey: enrollmentKeys.detail(id),
    queryFn: () => {
      if (!id) return Promise.reject(new Error("ID is required"));
      return show(api, id);
    },
    label: "Inscription",
    id,
  });

  return {
    enrollment: query.data,
    enrollmentIsLoading: query.isLoading,
    enrollmentError: query.error,
    loadEnrollment: query.refetch,
  };
}
