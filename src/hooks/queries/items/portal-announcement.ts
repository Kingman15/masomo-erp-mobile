import api from "@/api/client";
import {
  index,
  markAsRead,
  show,
} from "@/api/endpoints/portal-announcement";
import { portalAnnouncementKeys } from "@/utils/query-keys/portal-announcement";
import type { PortalAnnouncementDTO } from "@/utils/types/objects/PortalAnnouncementDTO";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

interface UsePortalAnnouncementsParams {
  filters: { schoolYearId?: string | null };
  enabled?: boolean;
}

export function usePortalAnnouncements({
  filters,
  enabled = true,
}: UsePortalAnnouncementsParams) {
  const query = useListQuery<PortalAnnouncementDTO>({
    queryKey: portalAnnouncementKeys.list(filters),
    queryFn: () => index(api, filters),
    label: "Communiqués",
    enabled: enabled && Boolean(filters.schoolYearId),
  });

  return {
    portalAnnouncements: query.data ?? [],
    portalAnnouncementsError: query.error,
    portalAnnouncementsIsLoading: query.isLoading,
    portalAnnouncementsIsFetching: query.isFetching,
    loadPortalAnnouncements: query.refetch,
  };
}

interface UsePortalAnnouncementParams {
  schoolYearId?: string | null;
  announcementId?: string | null;
}

export function usePortalAnnouncement({
  schoolYearId,
  announcementId,
}: UsePortalAnnouncementParams) {
  const query = useSingletonQuery<PortalAnnouncementDTO>({
    queryKey: portalAnnouncementKeys.detail(schoolYearId, announcementId),
    queryFn: () => show(api, announcementId!, schoolYearId!),
    label: "Communiqué",
    enabled: Boolean(schoolYearId && announcementId),
  });

  return {
    portalAnnouncement: query.data,
    portalAnnouncementIsLoading: query.isLoading,
    portalAnnouncementError: query.error,
    loadPortalAnnouncement: query.refetch,
  };
}

interface MarkAnnouncementAsReadParams {
  announcementId: string;
  schoolYearId: string;
  studentId?: string | null;
}

export function useMarkAnnouncementAsRead() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      announcementId,
      schoolYearId,
      studentId,
    }: MarkAnnouncementAsReadParams) =>
      markAsRead(api, announcementId, { schoolYearId, studentId }),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalAnnouncementKeys.all,
      });
    },
  });

  return {
    markAnnouncementAsRead: mutation.mutateAsync,
    markAnnouncementAsReadIsPending: mutation.isPending,
  };
}
