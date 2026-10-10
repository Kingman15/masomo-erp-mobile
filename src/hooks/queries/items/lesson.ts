import api from "@/api/client";
import {
  destroy,
  show as fetchLessonById,
  fileNumbers as fetchLessonFileNumbers,
  index,
  update,
  type LessonPayload,
} from "@/api/endpoints/lesson";
import type { LessonFileNumber } from "@/lib/lesson-file-numbers";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { useOfflineMutation } from "@/lib/offline/use-offline-mutation";
import { useOfflineQueue } from "@/lib/offline/use-offline-queue";
import { lessonKeys } from "@/utils/query-keys/lesson";
import { Lesson } from "@/utils/types/Lesson";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDetailQuery } from "../use-detail-query";
import { useInfiniteScrollQuery } from "../use-infinite-scroll-query";
import { useListQuery } from "../use-list-query";

interface UseLessonsParams {
  filters: {
    schoolYearId?: string | null;
    courseId?: string | null;
    schoolClassId?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    searchTerm?: string | null;
    teacherId?: string | null;
  };

  enabled?: boolean;
}

export function useLessons({ filters, enabled = true }: UseLessonsParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    courseId: filters.courseId ?? undefined,
    schoolClassId: filters.schoolClassId ?? undefined,
    startDate: filters.startDate ?? undefined,
    endDate: filters.endDate ?? undefined,
    searchTerm: filters.searchTerm ?? undefined,
    teacherId: filters.teacherId ?? undefined,
  };

  const query = useInfiniteScrollQuery<Lesson>({
    queryKey: lessonKeys.list(normalizedFilters),
    queryFn: (page, perPage) => index(api, normalizedFilters, page, perPage),
    label: "Leçons",
    enabled,
  });

  return {
    lessons: query.items,
    lessonsMeta: query.meta,
    lessonsError: query.error,
    lessonsIsLoading: query.isLoading,
    lessonsIsFetching: query.isFetching,
    lessonsIsFetchingNextPage: query.isFetchingNextPage,
    lessonsIsRefetching: query.isRefetching,
    lessonsHasNextPage: query.hasNextPage,
    fetchNextLessons: query.fetchNextPage,
    loadLessons: query.refetch,
  };
}

interface LessonFileNumbersFilters {
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  courseId?: string | null;
}

export function lessonFileNumbersQuery(
  filters: LessonFileNumbersFilters,
): QueryDefinition<LessonFileNumber[]> {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? null,
    schoolClassId: filters.schoolClassId ?? null,
    courseId: filters.courseId ?? null,
  };

  return {
    queryKey: lessonKeys.fileNumbers(normalizedFilters),
    queryFn: () => fetchLessonFileNumbers(api, normalizedFilters),
    label: "Numéros de fiche",
  };
}

/**
 * Numéros de fiche du cours, y compris ceux des leçons encore dans la file d'envoi :
 * hors ligne, deux leçons saisies à la suite se voient proposer des numéros différents.
 */
export function useLessonFileNumbers(filters: LessonFileNumbersFilters) {
  const query = useListQuery<LessonFileNumber>({
    ...lessonFileNumbersQuery(filters),
    enabled: Boolean(
      filters.schoolYearId && filters.schoolClassId && filters.courseId,
    ),
    offline: true,
  });

  const queue = useOfflineQueue();

  const lessonFileNumbers = useMemo(() => {
    if (!query.data) return undefined;

    const queued = queue
      .filter((item) => item.name === "lesson.create")
      .map((item) => item.payload as LessonPayload)
      .filter(
        (payload) =>
          payload.schoolYearId === filters.schoolYearId &&
          payload.schoolClassId === filters.schoolClassId &&
          payload.courseId === filters.courseId,
      )
      .map((payload) => ({
        id: payload.id ?? "",
        fileNo: payload.fileNo,
        lessonDate: payload.lessonDate,
      }));

    return [...queued, ...query.data];
  }, [
    query.data,
    queue,
    filters.schoolYearId,
    filters.schoolClassId,
    filters.courseId,
  ]);

  return { lessonFileNumbers };
}

export function useLessonById(id: string | undefined) {
  const query = useDetailQuery<Lesson>({
    queryKey: lessonKeys.detail(id),
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error("ID is required"));
      }
      return fetchLessonById(api, id);
    },
    label: "Leçon",
    id,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  return {
    lesson: query.data,
    lessonIsLoading: query.isLoading,
    lessonError: query.error,
    loadLesson: query.refetch,
  };
}

// Création rejouable hors ligne (file offline) ; la modification reste en ligne.
export function useCreateLesson() {
  const { submit, isPending } = useOfflineMutation<"lesson.create", Lesson>(
    "lesson.create",
  );

  return {
    createLesson: submit,
    createLessonIsPending: isPending,
  };
}

export function useUpdateLesson(id: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: LessonPayload) => {
      if (!id) return Promise.reject(new Error("No lesson to update"));
      return update(api, id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });

  return {
    updateLesson: mutation.mutateAsync,
    updateLessonIsPending: mutation.isPending,
  };
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => destroy(api, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });

  return {
    deleteLesson: mutation.mutateAsync,
    deleteLessonIsPending: mutation.isPending,
  };
}
