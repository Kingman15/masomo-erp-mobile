import {
  useMarkAnnouncementAsRead,
  usePortalAnnouncements,
} from "@/hooks/queries/items/portal-announcement";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import type { PortalAnnouncementDTO } from "@/utils/types/objects/PortalAnnouncementDTO";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { AnnouncementListView } from "./announcement-list-view";

export function AnnouncementsScreen() {
  const { selectedStudent, selectedSchoolYear } = usePortalSelection();
  const [markingAsReadId, setMarkingAsReadId] = useState<string | null>(null);

  const filtersAreComplete = Boolean(selectedSchoolYear?.id);

  const {
    portalAnnouncements,
    portalAnnouncementsError,
    portalAnnouncementsIsLoading,
    portalAnnouncementsIsFetching,
    loadPortalAnnouncements,
  } = usePortalAnnouncements({
    filters: { schoolYearId: selectedSchoolYear?.id },
    enabled: filtersAreComplete,
  });

  const { markAnnouncementAsRead } = useMarkAnnouncementAsRead();

  const handlePressAnnouncement = (announcement: PortalAnnouncementDTO) => {
    router.push(`/portal/menu/communication/announcements/${announcement.id}`);
  };

  const handleMarkAsRead = async (announcement: PortalAnnouncementDTO) => {
    if (!selectedSchoolYear?.id) return;

    setMarkingAsReadId(announcement.id);
    try {
      await markAnnouncementAsRead({
        announcementId: announcement.id,
        schoolYearId: selectedSchoolYear.id,
        studentId: selectedStudent?.id,
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
      <Stack.Screen options={{ headerShown: true, title: "Communiqués" }} />

      <View className="flex-1 bg-background">
        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-foreground-secondary text-center">
              Aucune année scolaire sélectionnée
            </Text>
            <Text className="text-sm text-faint text-center">
              Sélectionnez une année scolaire pour afficher les communiqués.
            </Text>
          </View>
        ) : (
          <AnnouncementListView
            announcements={portalAnnouncements}
            isLoading={portalAnnouncementsIsLoading}
            isFetching={portalAnnouncementsIsFetching}
            error={portalAnnouncementsError}
            onReload={() => void loadPortalAnnouncements()}
            onPress={handlePressAnnouncement}
            onMarkAsRead={(announcement) => void handleMarkAsRead(announcement)}
            markingAsReadId={markingAsReadId}
            emptyLabel="Aucun communiqué n'a été publié pour cette année scolaire."
          />
        )}
      </View>
    </>
  );
}
