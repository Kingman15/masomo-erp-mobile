import { AnnouncementDetailView } from "@/features/portal/communication/announcements/announcement-detail-view";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import {
  useMarkStaffAnnouncementAsRead,
  useStaffAnnouncement,
} from "@/hooks/queries/items/staff-announcement";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentSchoolYear, currentSchoolYearIsLoading } =
    useCurrentSchoolYear();
  const schoolYearId = currentSchoolYear?.id;

  const {
    staffAnnouncement: announcement,
    staffAnnouncementIsLoading,
    staffAnnouncementError,
    loadStaffAnnouncement,
  } = useStaffAnnouncement(schoolYearId, id);

  const { markStaffAnnouncementAsRead, markStaffAnnouncementAsReadIsPending } =
    useMarkStaffAnnouncementAsRead();

  const handleMarkAsRead = async () => {
    if (!announcement || !schoolYearId) return;

    try {
      await markStaffAnnouncementAsRead({
        announcementId: announcement.id,
        schoolYearId,
      });
      toastNotify("Communiqué marqué comme lu.", "success");
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Communiqué" }} />

      <View className="flex-1 bg-background">
        <AnnouncementDetailView
          announcement={announcement}
          isLoading={currentSchoolYearIsLoading || staffAnnouncementIsLoading}
          error={staffAnnouncementError}
          onReload={() => void loadStaffAnnouncement()}
          onMarkAsRead={() => void handleMarkAsRead()}
          isMarkingAsRead={markStaffAnnouncementAsReadIsPending}
        />
      </View>
    </>
  );
}
