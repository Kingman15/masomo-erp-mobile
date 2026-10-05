import api from "@/api/client";
import { index, markAsRead, show } from "@/api/endpoints/staff-announcement";
import { staffAnnouncementKeys } from "@/utils/query-keys/staff-announcement";
import type { PortalAnnouncementDTO } from "@/utils/types/objects/PortalAnnouncementDTO";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

export function useStaffAnnouncements(schoolYearId: string | undefined | null) {
  const query = useListQuery<PortalAnnouncementDTO>({
    queryKey: staffAnnouncementKeys.list(schoolYearId),
    queryFn: () => index(api, schoolYearId!),
    label: "Communiqués",
    enabled: Boolean(schoolYearId),
  });

  return {
    staffAnnouncements: query.data ?? [],
    staffAnnouncementsError: query.error,
    staffAnnouncementsIsLoading: query.isLoading,
    staffAnnouncementsIsFetching: query.isFetching,
    loadStaffAnnouncements: query.refetch,
  };
}

export function useStaffAnnouncement(
  schoolYearId: string | undefined | null,
  announcementId: string | undefined | null,
) {
  const query = useSingletonQuery<PortalAnnouncementDTO>({
    queryKey: staffAnnouncementKeys.detail(schoolYearId, announcementId),
    queryFn: () => show(api, announcementId!, schoolYearId!),
    label: "Communiqué",
    enabled: Boolean(schoolYearId && announcementId),
  });

  return {
    staffAnnouncement: query.data,
    staffAnnouncementIsLoading: query.isLoading,
    staffAnnouncementError: query.error,
    loadStaffAnnouncement: query.refetch,
  };
}

export function useMarkStaffAnnouncementAsRead() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      announcementId,
      schoolYearId,
    }: {
      announcementId: string;
      schoolYearId: string;
    }) => markAsRead(api, announcementId, schoolYearId),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: staffAnnouncementKeys.all,
      });
    },
  });

  return {
    markStaffAnnouncementAsRead: mutation.mutateAsync,
    markStaffAnnouncementAsReadIsPending: mutation.isPending,
  };
}
