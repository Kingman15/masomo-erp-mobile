import {
  useMarkAnnouncementAsRead,
  usePortalAnnouncement,
} from "@/hooks/queries/items/portal-announcement";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { AnnouncementDetailView } from "./announcement-detail-view";

export function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedStudent, selectedSchoolYear } = usePortalSelection();

  const {
    portalAnnouncement: announcement,
    portalAnnouncementIsLoading,
    portalAnnouncementError,
    loadPortalAnnouncement,
  } = usePortalAnnouncement({
    schoolYearId: selectedSchoolYear?.id,
    announcementId: id,
  });

  const { markAnnouncementAsRead, markAnnouncementAsReadIsPending } =
    useMarkAnnouncementAsRead();

  const handleMarkAsRead = async () => {
    if (!announcement || !selectedSchoolYear?.id) return;

    try {
      await markAnnouncementAsRead({
        announcementId: announcement.id,
        schoolYearId: selectedSchoolYear.id,
        studentId: selectedStudent?.id,
      });
      toastNotify("Communiqué marqué comme lu.", "success");
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Communiqué" }} />

      <View className="flex-1 bg-background">
        <AnnouncementDetailView
          announcement={announcement}
          isLoading={portalAnnouncementIsLoading}
          error={portalAnnouncementError}
          onReload={() => void loadPortalAnnouncement()}
          onMarkAsRead={() => void handleMarkAsRead()}
          isMarkingAsRead={markAnnouncementAsReadIsPending}
        />
      </View>
    </>
  );
}
