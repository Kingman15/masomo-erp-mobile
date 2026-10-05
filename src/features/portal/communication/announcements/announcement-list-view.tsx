import type { PortalAnnouncementDTO } from "@/utils/types/objects/PortalAnnouncementDTO";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { AnnouncementRow } from "./announcement-row";

// Liste partagée par le portail (parents, élèves) et l'espace enseignant : seule la source des données change.
type AnnouncementListViewProps = {
  announcements: PortalAnnouncementDTO[];
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onReload: () => void;
  onPress: (announcement: PortalAnnouncementDTO) => void;
  onMarkAsRead: (announcement: PortalAnnouncementDTO) => void;
  markingAsReadId: string | null;
  emptyLabel: string;
};

export function AnnouncementListView({
  announcements,
  isLoading,
  isFetching,
  error,
  onReload,
  onPress,
  onMarkAsRead,
  markingAsReadId,
  emptyLabel,
}: AnnouncementListViewProps) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6 gap-3">
        <Text className="text-sm text-muted-foreground text-center">
          Impossible de charger les communiqués.
        </Text>
        <Pressable
          onPress={onReload}
          className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
        >
          <Text className="text-background font-medium">Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={onReload} />
      }
    >
      {announcements.length === 0 ? (
        <View className="items-center justify-center px-6 py-16">
          <Text className="text-sm text-faint text-center">{emptyLabel}</Text>
        </View>
      ) : (
        announcements.map((announcement, index) => (
          <AnnouncementRow
            key={announcement.id}
            item={announcement}
            onPress={onPress}
            onMarkAsRead={onMarkAsRead}
            isMarkingAsRead={markingAsReadId === announcement.id}
            isFirst={index === 0}
          />
        ))
      )}
    </ScrollView>
  );
}
