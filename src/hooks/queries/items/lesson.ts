import api from "@/api/client";
import {
  show as fetchLessonById,
  index,
  store,
  update,
  type LessonPayload,
} from "@/api/endpoints/lesson";
import { lessonKeys } from "@/utils/query-keys/lesson";
import { Lesson } from "@/utils/types/Lesson";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDetailQuery } from "../use-detail-query";
import { useInfiniteScrollQuery } from "../use-infinite-scroll-query";

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

export function useCreateLesson() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: LessonPayload) => store(api, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });

  return {
    createLesson: mutation.mutateAsync,
    createLessonIsPending: mutation.isPending,
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
