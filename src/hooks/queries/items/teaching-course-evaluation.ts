import api from "@/api/client";
import {
  destroy,
  index,
  publish,
  show as fetchTeachingCourseEvaluationById,
  store,
  update,
  updateCountsTowardsFinal,
} from "@/api/endpoints/teachingCourseEvaluation";
import {
  TeachingCourseEvaluationCountsTowardsFinalFormValues,
  TeachingCourseEvaluationFormValues,
  TeachingCourseEvaluationPublishFormValues,
} from "@/utils/schemas/teaching-course-evaluation-schema";
import { teachingCourseEvaluationKeys } from "@/utils/query-keys/teaching-course-evaluation";
import { TeachingCourseEvaluation } from "@/utils/types/TeachingCourseEvaluation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDetailQuery } from "../use-detail-query";
import { useInfiniteScrollQuery } from "../use-infinite-scroll-query";

interface UseTeachingCourseEvaluationsParams {
  filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    courseId?: string | null;
    evaluationPeriodId?: string | null;
    teachingCourseEvaluationTypeId?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  };

  enabled?: boolean;
}

export function useTeachingCourseEvaluations({
  filters,
  enabled = true,
}: UseTeachingCourseEvaluationsParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    schoolClassId: filters.schoolClassId ?? undefined,
    courseId: filters.courseId ?? undefined,
    evaluationPeriodId: filters.evaluationPeriodId ?? undefined,
    teachingCourseEvaluationTypeId:
      filters.teachingCourseEvaluationTypeId ?? undefined,
    startDate: filters.startDate ?? undefined,
    endDate: filters.endDate ?? undefined,
  };

  const query = useInfiniteScrollQuery<TeachingCourseEvaluation>({
    queryKey: teachingCourseEvaluationKeys.list(normalizedFilters),
    queryFn: (page, perPage) => index(api, normalizedFilters, page, perPage),
    label: "Évaluations",
    enabled: Boolean(filters.schoolYearId) && enabled,
  });

  return {
    teachingCourseEvaluations: query.items,
    teachingCourseEvaluationsMeta: query.meta,
    teachingCourseEvaluationsError: query.error,
    teachingCourseEvaluationsIsLoading: query.isLoading,
    teachingCourseEvaluationsIsFetching: query.isFetching,
    teachingCourseEvaluationsIsFetchingNextPage: query.isFetchingNextPage,
    teachingCourseEvaluationsIsRefetching: query.isRefetching,
    teachingCourseEvaluationsHasNextPage: query.hasNextPage,
    fetchNextTeachingCourseEvaluations: query.fetchNextPage,
    loadTeachingCourseEvaluations: query.refetch,
  };
}

export function useTeachingCourseEvaluationById(id: string | undefined) {
  const query = useDetailQuery<TeachingCourseEvaluation>({
    queryKey: teachingCourseEvaluationKeys.detail(id),
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error("ID is required"));
      }
      return fetchTeachingCourseEvaluationById(api, id);
    },
    label: "Évaluation",
    id,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  return {
    teachingCourseEvaluation: query.data,
    teachingCourseEvaluationIsLoading: query.isLoading,
    teachingCourseEvaluationError: query.error,
    loadTeachingCourseEvaluation: query.refetch,
  };
}

export function useCreateTeachingCourseEvaluation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: TeachingCourseEvaluationFormValues) =>
      store(api, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationKeys.all,
      });
    },
  });

  return {
    createTeachingCourseEvaluation: mutation.mutateAsync,
    createTeachingCourseEvaluationIsPending: mutation.isPending,
  };
}

export function useUpdateTeachingCourseEvaluation(id: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: TeachingCourseEvaluationFormValues) => {
      if (!id) return Promise.reject(new Error("No evaluation to update"));
      return update(api, id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationKeys.all,
      });
    },
  });

  return {
    updateTeachingCourseEvaluation: mutation.mutateAsync,
    updateTeachingCourseEvaluationIsPending: mutation.isPending,
  };
}

export function useDeleteTeachingCourseEvaluation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => destroy(api, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationKeys.all,
      });
    },
  });

  return {
    deleteTeachingCourseEvaluation: mutation.mutateAsync,
    deleteTeachingCourseEvaluationIsPending: mutation.isPending,
  };
}

export function usePublishTeachingCourseEvaluation(id: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: TeachingCourseEvaluationPublishFormValues) => {
      if (!id) return Promise.reject(new Error("No evaluation to publish"));
      return publish(api, id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationKeys.all,
      });
    },
  });

  return {
    publishTeachingCourseEvaluation: mutation.mutateAsync,
    publishTeachingCourseEvaluationIsPending: mutation.isPending,
  };
}

export function useUpdateTeachingCourseEvaluationCountsTowardsFinal(
  id: string | undefined,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: TeachingCourseEvaluationCountsTowardsFinalFormValues) => {
      if (!id) return Promise.reject(new Error("No evaluation to update"));
      return updateCountsTowardsFinal(api, id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationKeys.all,
      });
    },
  });

  return {
    updateTeachingCourseEvaluationCountsTowardsFinal: mutation.mutateAsync,
    updateTeachingCourseEvaluationCountsTowardsFinalIsPending:
      mutation.isPending,
  };
}
