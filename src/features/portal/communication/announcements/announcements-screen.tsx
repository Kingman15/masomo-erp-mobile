import {
  useMarkAnnouncementAsRead,
  usePortalAnnouncements,
} from "@/hooks/queries/items/portal-announcement";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import type { PortalAnnouncementDTO } from "@/utils/types/objects/PortalAnnouncementDTO";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { AnnouncementRow } from "./announcement-row";

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

  const { markAnnouncementAsRead, markAnnouncementAsReadIsPending } =
    useMarkAnnouncementAsRead();

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
        ) : portalAnnouncementsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalAnnouncementsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger les communiqués.
            </Text>
            <Pressable
              onPress={() => loadPortalAnnouncements()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={portalAnnouncementsIsFetching}
                onRefresh={() => void loadPortalAnnouncements()}
              />
            }
          >
            {portalAnnouncements.length === 0 ? (
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-faint text-center">
                  Aucun communiqué n&apos;a été publié pour cette année
                  scolaire.
                </Text>
              </View>
            ) : (
              portalAnnouncements.map((announcement, index) => (
                <AnnouncementRow
                  key={announcement.id}
                  item={announcement}
                  onPress={handlePressAnnouncement}
                  onMarkAsRead={handleMarkAsRead}
                  isMarkingAsRead={
                    markAnnouncementAsReadIsPending &&
                    markingAsReadId === announcement.id
                  }
                  isFirst={index === 0}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
