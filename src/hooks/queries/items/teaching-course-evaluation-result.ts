import api from "@/api/client";
import {
  exportResults,
  getByEvaluation,
  importResults,
  submit,
  type TeachingCourseEvaluationResultSaveResult,
} from "@/api/endpoints/teachingCourseEvaluationResult";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { useOfflineMutation } from "@/lib/offline/use-offline-mutation";
import { teachingCourseEvaluationKeys } from "@/utils/query-keys/teaching-course-evaluation";
import { teachingCourseEvaluationResultKeys } from "@/utils/query-keys/teaching-course-evaluation-result";
import { TeachingCourseEvaluationResultRosterEntry } from "@/utils/types/TeachingCourseEvaluationResult";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useListQuery } from "../use-list-query";

export function teachingCourseEvaluationResultRosterQuery(
  evaluationId: string | undefined,
): QueryDefinition<TeachingCourseEvaluationResultRosterEntry[]> {
  return {
    queryKey: teachingCourseEvaluationResultKeys.roster(evaluationId),
    queryFn: () => {
      if (!evaluationId) {
        return Promise.reject(new Error("ID is required"));
      }
      return getByEvaluation(api, evaluationId);
    },
    label: "Résultats",
  };
}

export function useTeachingCourseEvaluationResultRoster(
  evaluationId: string | undefined,
) {
  const query = useListQuery<TeachingCourseEvaluationResultRosterEntry>({
    ...teachingCourseEvaluationResultRosterQuery(evaluationId),
    enabled: Boolean(evaluationId),
    offline: true,
  });

  return {
    teachingCourseEvaluationResultRoster: query.data,
    teachingCourseEvaluationResultRosterError: query.error,
    teachingCourseEvaluationResultRosterIsLoading: query.isLoading,
    teachingCourseEvaluationResultRosterIsFetching: query.isFetching,
    loadTeachingCourseEvaluationResultRoster: query.refetch,
  };
}

// Saisie de notes rejouable hors ligne (file offline).
export function useSaveTeachingCourseEvaluationResults() {
  const { submit, isPending } = useOfflineMutation<
    "grades.save",
    TeachingCourseEvaluationResultSaveResult
  >("grades.save");

  return {
    saveTeachingCourseEvaluationResults: submit,
    saveTeachingCourseEvaluationResultsIsPending: isPending,
  };
}

export function useSubmitTeachingCourseEvaluationResults(
  evaluationId: string | undefined,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (resultIds: string[]) => {
      if (!evaluationId) {
        return Promise.reject(new Error("ID is required"));
      }
      return submit(api, evaluationId, resultIds);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationResultKeys.roster(evaluationId),
      });
    },
  });

  return {
    submitTeachingCourseEvaluationResults: mutation.mutateAsync,
    submitTeachingCourseEvaluationResultsIsPending: mutation.isPending,
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
