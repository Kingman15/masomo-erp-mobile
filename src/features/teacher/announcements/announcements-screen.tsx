import { AnnouncementListView } from "@/features/portal/communication/announcements/announcement-list-view";
import { DrawerMenuButton } from "@/features/teacher/drawer-menu-button";
import { useCurrentSchoolYear } from "@/hooks/queries/items/school-year";
import {
  useMarkStaffAnnouncementAsRead,
  useStaffAnnouncements,
} from "@/hooks/queries/items/staff-announcement";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import type { PortalAnnouncementDTO } from "@/utils/types/objects/PortalAnnouncementDTO";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

// Communiqués adressés aux enseignants ou au personnel, sur l'année en cours.
export function AnnouncementsScreen() {
  const { currentSchoolYear, currentSchoolYearIsLoading } =
    useCurrentSchoolYear();
  const schoolYearId = currentSchoolYear?.id;
  const [markingAsReadId, setMarkingAsReadId] = useState<string | null>(null);

  const {
    staffAnnouncements,
    staffAnnouncementsError,
    staffAnnouncementsIsLoading,
    staffAnnouncementsIsFetching,
    loadStaffAnnouncements,
  } = useStaffAnnouncements(schoolYearId);

  const { markStaffAnnouncementAsRead } = useMarkStaffAnnouncementAsRead();

  const handleMarkAsRead = async (announcement: PortalAnnouncementDTO) => {
    if (!schoolYearId) return;

    setMarkingAsReadId(announcement.id);
    try {
      await markStaffAnnouncementAsRead({
        announcementId: announcement.id,
        schoolYearId,
      });
      toastNotify("Communiqué marqué comme lu.", "success");
    } catch (error) {
      handleApiError(error);
    } finally {
      setMarkingAsReadId(null);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Communiqués",
          headerLeft: () => <DrawerMenuButton />,
        }}
      />

      <View className="flex-1 bg-background">
        <AnnouncementListView
          announcements={staffAnnouncements}
          isLoading={currentSchoolYearIsLoading || staffAnnouncementsIsLoading}
          isFetching={staffAnnouncementsIsFetching}
          error={staffAnnouncementsError}
          onReload={() => void loadStaffAnnouncements()}
          onPress={(announcement) =>
            router.push(`/teacher/announcements/${announcement.id}`)
          }
          onMarkAsRead={(announcement) => void handleMarkAsRead(announcement)}
          markingAsReadId={markingAsReadId}
          emptyLabel="Aucun communiqué ne vous a été adressé cette année."
        />
      </View>
    </>
  );
}
