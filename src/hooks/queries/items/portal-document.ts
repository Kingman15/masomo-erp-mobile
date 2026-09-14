import api from "@/api/client";
import {
  attachable,
  index,
  show,
  storeUpload,
  type CreatePortalDocumentUploadPayload,
} from "@/api/endpoints/portal-document";
import { portalDocumentKeys } from "@/utils/query-keys/portal-document";
import type { PortalDocumentDTO } from "@/utils/types/objects/PortalDocumentDTO";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

interface UsePortalDocumentsParams {
  filters: { schoolYearId?: string | null };
  enabled?: boolean;
}

export function usePortalDocuments({
  filters,
  enabled = true,
}: UsePortalDocumentsParams) {
  const query = useListQuery<PortalDocumentDTO>({
    queryKey: portalDocumentKeys.list(filters),
    queryFn: () => index(api, filters),
    label: "Documents partagés",
    enabled: enabled && Boolean(filters.schoolYearId),
  });

  return {
    portalDocuments: query.data ?? [],
    portalDocumentsError: query.error,
    portalDocumentsIsLoading: query.isLoading,
    portalDocumentsIsFetching: query.isFetching,
    loadPortalDocuments: query.refetch,
  };
}

interface UsePortalDocumentParams {
  schoolYearId?: string | null;
  documentId?: string | null;
}

export function usePortalDocument({
  schoolYearId,
  documentId,
}: UsePortalDocumentParams) {
  const query = useSingletonQuery<PortalDocumentDTO>({
    queryKey: portalDocumentKeys.detail(schoolYearId, documentId),
    queryFn: () => show(api, documentId!, schoolYearId!),
    label: "Document",
    enabled: Boolean(schoolYearId && documentId),
  });

  return {
    portalDocument: query.data,
    portalDocumentIsLoading: query.isLoading,
    portalDocumentError: query.error,
    loadPortalDocument: query.refetch,
  };
}

interface UsePortalAttachableDocumentsParams {
  enabled?: boolean;
}

export function usePortalAttachableDocuments({
  enabled = true,
}: UsePortalAttachableDocumentsParams = {}) {
  const query = useListQuery<PortalDocumentDTO>({
    queryKey: portalDocumentKeys.attachable(),
    queryFn: () => attachable(api),
    label: "Documents joignables",
    enabled,
  });

  return {
    portalAttachableDocuments: query.data ?? [],
    portalAttachableDocumentsError: query.error,
    portalAttachableDocumentsIsLoading: query.isLoading,
    loadPortalAttachableDocuments: query.refetch,
  };
}

export function useUploadPortalDocument() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreatePortalDocumentUploadPayload) =>
      storeUpload(api, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portalDocumentKeys.all });
    },
  });

  return {
    uploadPortalDocument: mutation.mutateAsync,
    uploadPortalDocumentIsPending: mutation.isPending,
  };
}
