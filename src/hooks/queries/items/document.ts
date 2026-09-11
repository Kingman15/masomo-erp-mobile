import api from "@/api/client";
import {
  index,
  show,
  store,
  type CreateDocumentPayload,
} from "@/api/endpoints/document";
import { documentKeys } from "@/utils/query-keys/document";
import { Document } from "@/utils/types/Document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDetailQuery } from "../use-detail-query";
import { useListQuery } from "../use-list-query";

interface UseDocumentsParams {
  filters: {
    schoolYearId?: string | null;
    audienceType?: string | null;
    audienceId?: string | null;
    search?: string | null;
  };
  enabled?: boolean;
}

export function useDocuments({ filters, enabled = true }: UseDocumentsParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    audienceType: filters.audienceType ?? undefined,
    audienceId: filters.audienceId ?? undefined,
    search: filters.search?.trim() || undefined,
  };

  const query = useListQuery<Document>({
    queryKey: documentKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Documents partagés",
    enabled: Boolean(filters.schoolYearId) && enabled,
  });

  return {
    documents: query.data ?? [],
    documentsError: query.error,
    documentsIsLoading: query.isLoading,
    documentsIsFetching: query.isFetching,
    loadDocuments: query.refetch,
  };
}

export function useDocumentById(id: string | undefined) {
  const query = useDetailQuery<Document>({
    queryKey: documentKeys.detail(id),
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error("ID is required"));
      }
      return show(api, id);
    },
    label: "Document",
    id,
  });

  return {
    document: query.data,
    documentIsLoading: query.isLoading,
    documentError: query.error,
    loadDocument: query.refetch,
  };
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateDocumentPayload) => store(api, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });

  return {
    createDocument: mutation.mutateAsync,
    createDocumentIsPending: mutation.isPending,
  };
}
