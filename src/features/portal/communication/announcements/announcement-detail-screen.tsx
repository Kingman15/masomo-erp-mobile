import { documentIconName } from "@/features/teacher/documents/document-icon";
import {
  useMarkAnnouncementAsRead,
  usePortalAnnouncement,
} from "@/hooks/queries/items/portal-announcement";
import { handleApiError } from "@/lib/handle-api-error";
import { formatDateTime } from "@/lib/format";
import { toastNotify } from "@/lib/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { ANNOUNCEMENT_CATEGORY_LABEL_MAP } from "./announcement-category";

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color="#6B7280" />
      <Text className="text-xs text-gray-500 w-28">{label}</Text>
      <Text className="flex-1 text-sm text-black">{value}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-500 uppercase mb-1 mt-4">
      {children}
    </Text>
  );
}

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

      <View className="flex-1 bg-white">
        {portalAnnouncementIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalAnnouncementError || !announcement ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger le communiqué.
            </Text>
            <Pressable
              onPress={() => loadPortalAnnouncement()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row items-center gap-1.5 flex-wrap">
              {announcement.isPinned && (
                <Ionicons name="pin" size={14} color="#6B7280" />
              )}
              <Text className="text-lg font-bold text-black flex-1" numberOfLines={2}>
                {announcement.title}
              </Text>
            </View>

            <View className="flex-row items-center gap-2 mt-2 flex-wrap">
              {announcement.category && (
                <View className="px-2 py-0.5 rounded-full bg-gray-100">
                  <Text className="text-xs font-medium text-gray-600">
                    {ANNOUNCEMENT_CATEGORY_LABEL_MAP[announcement.category]}
                  </Text>
                </View>
              )}

              <View
                className={`px-2 py-0.5 rounded-full ${announcement.isRead ? "bg-green-100" : "bg-amber-100"}`}
              >
                <Text
                  className={`text-xs font-medium ${announcement.isRead ? "text-green-700" : "text-amber-700"}`}
                >
                  {announcement.isRead ? "Lu" : "Non lu"}
                </Text>
              </View>
            </View>

            {!announcement.isRead && (
              <Pressable
                onPress={handleMarkAsRead}
                disabled={markAnnouncementAsReadIsPending}
                className="flex-row items-center justify-center gap-2 h-11 mt-4 rounded-lg bg-black"
              >
                {markAnnouncementAsReadIsPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                )}
                <Text className="text-white font-medium">
                  {markAnnouncementAsReadIsPending
                    ? "En cours..."
                    : "Marquer comme lu"}
                </Text>
              </Pressable>
            )}

            <SectionTitle>Informations</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow
                icon="calendar-outline"
                label="Publié le"
                value={formatDateTime(announcement.publishedAt)}
              />
              <InfoRow
                icon="hourglass-outline"
                label="Expire le"
                value={
                  announcement.expiresAt
                    ? formatDateTime(announcement.expiresAt)
                    : "—"
                }
              />
            </View>

            {announcement.body && (
              <View className="mt-2">
                <SectionTitle>Contenu</SectionTitle>
                <Text className="text-sm text-black">{announcement.body}</Text>
              </View>
            )}

            {announcement.documents.length > 0 && (
              <View>
                <SectionTitle>Pièces jointes</SectionTitle>
                <View className="border-t border-gray-100">
                  {announcement.documents.map((item) => {
                    if (!item.document) return null;
                    const name =
                      item.document.title ??
                      item.document.originalName ??
                      "Sans nom";

                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          if (item.document?.url) {
                            void openBrowserAsync(item.document.url);
                          }
                        }}
                        disabled={!item.document.url}
                        className="flex-row items-center gap-3 py-2.5 border-b border-gray-100"
                      >
                        <Ionicons
                          name={documentIconName(item.document.mimeType)}
                          size={18}
                          color="#6B7280"
                        />
                        <Text className="flex-1 text-sm text-black" numberOfLines={1}>
                          {name}
                        </Text>
                        {item.document.url && (
                          <Ionicons name="download-outline" size={18} color="#6B7280" />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
