import api from "@/api/client";
import {
  destroy,
  index,
  store,
  type UploadDocumentPayload,
} from "@/api/endpoints/teachingCourseEvaluationDocument";
import { teachingCourseEvaluationKeys } from "@/utils/query-keys/teaching-course-evaluation";
import { TeachingCourseEvaluationDocument } from "@/utils/types/TeachingCourseEvaluationDocument";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useListQuery } from "../use-list-query";

export function useTeachingCourseEvaluationDocuments(
  evaluationId: string | undefined,
) {
  const query = useListQuery<TeachingCourseEvaluationDocument>({
    queryKey: teachingCourseEvaluationKeys.documents(evaluationId),
    queryFn: () => {
      if (!evaluationId) {
        return Promise.reject(new Error("ID is required"));
      }
      return index(api, evaluationId);
    },
    label: "Documents",
    enabled: Boolean(evaluationId),
  });

  return {
    teachingCourseEvaluationDocuments: query.data,
    teachingCourseEvaluationDocumentsError: query.error,
    teachingCourseEvaluationDocumentsIsLoading: query.isLoading,
    loadTeachingCourseEvaluationDocuments: query.refetch,
    teachingCourseEvaluationDocumentsIsFetching: query.isFetching,
  };
}

export function useUploadTeachingCourseEvaluationDocument(
  evaluationId: string | undefined,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UploadDocumentPayload) => {
      if (!evaluationId) {
        return Promise.reject(new Error("No evaluation to attach to"));
      }
      return store(api, evaluationId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationKeys.documents(evaluationId),
      });
    },
  });

  return {
    uploadTeachingCourseEvaluationDocument: mutation.mutateAsync,
    uploadTeachingCourseEvaluationDocumentIsPending: mutation.isPending,
  };
}

export function useDeleteTeachingCourseEvaluationDocument(
  evaluationId: string | undefined,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (linkId: string) => {
      if (!evaluationId) {
        return Promise.reject(new Error("No evaluation to detach from"));
      }
      return destroy(api, evaluationId, linkId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teachingCourseEvaluationKeys.documents(evaluationId),
      });
    },
  });

  return {
    deleteTeachingCourseEvaluationDocument: mutation.mutateAsync,
    deleteTeachingCourseEvaluationDocumentIsPending: mutation.isPending,
  };
}
