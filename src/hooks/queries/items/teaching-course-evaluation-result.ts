import api from "@/api/client";
import {
  exportResults,
  getByEvaluation,
  importResults,
  save,
} from "@/api/endpoints/teachingCourseEvaluationResult";
import { teachingCourseEvaluationKeys } from "@/utils/query-keys/teaching-course-evaluation";
import { teachingCourseEvaluationResultKeys } from "@/utils/query-keys/teaching-course-evaluation-result";
import { TeachingCourseEvaluationResultFormValues } from "@/utils/schemas/teaching-course-evaluation-result-schema";
import { TeachingCourseEvaluationResultRosterEntry } from "@/utils/types/TeachingCourseEvaluationResult";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useListQuery } from "../use-list-query";

export function useTeachingCourseEvaluationResultRoster(
  evaluationId: string | undefined,
) {
  const query = useListQuery<TeachingCourseEvaluationResultRosterEntry>({
    queryKey: teachingCourseEvaluationResultKeys.roster(evaluationId),
    queryFn: () => {
      if (!evaluationId) {
        return Promise.reject(new Error("ID is required"));
      }
      return getByEvaluation(api, evaluationId);
    },
    label: "Résultats",
    enabled: Boolean(evaluationId),
  });

  return {
    teachingCourseEvaluationResultRoster: query.data,
    teachingCourseEvaluationResultRosterError: query.error,
    teachingCourseEvaluationResultRosterIsLoading: query.isLoading,
    teachingCourseEvaluationResultRosterIsFetching: query.isFetching,
    loadTeachingCourseEvaluationResultRoster: query.refetch,
  };
}

export function useSaveTeachingCourseEvaluationResults(
  evaluationId: string | undefined,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: TeachingCourseEvaluationResultFormValues) =>
      save(api, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationResultKeys.roster(evaluationId),
      });
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationKeys.detail(evaluationId),
      });
    },
  });

  return {
    saveTeachingCourseEvaluationResults: mutation.mutateAsync,
    saveTeachingCourseEvaluationResultsIsPending: mutation.isPending,
  };
}

export function useExportTeachingCourseEvaluationResults(
  evaluationId: string | undefined,
) {
  const mutation = useMutation({
    mutationFn: () => {
      if (!evaluationId) {
        return Promise.reject(new Error("ID is required"));
      }
      return exportResults(api, evaluationId);
    },
  });

  return {
    exportTeachingCourseEvaluationResults: mutation.mutateAsync,
    exportTeachingCourseEvaluationResultsIsPending: mutation.isPending,
  };
}

export function useImportTeachingCourseEvaluationResults(
  evaluationId: string | undefined,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: { uri: string; name: string; mimeType: string }) => {
      if (!evaluationId) {
        return Promise.reject(new Error("ID is required"));
      }
      return importResults(api, evaluationId, file);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationResultKeys.roster(evaluationId),
      });
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationKeys.detail(evaluationId),
      });
    },
  });

  return {
    importTeachingCourseEvaluationResults: mutation.mutateAsync,
    importTeachingCourseEvaluationResultsIsPending: mutation.isPending,
  };
}
