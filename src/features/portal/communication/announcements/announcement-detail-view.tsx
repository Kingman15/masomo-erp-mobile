import { documentIconName } from "@/features/teacher/documents/document-icon";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatDateTime } from "@/lib/format";
import type { PortalAnnouncementDTO } from "@/utils/types/objects/PortalAnnouncementDTO";
import Ionicons from "@expo/vector-icons/Ionicons";
import { openBrowserAsync } from "expo-web-browser";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ANNOUNCEMENT_CATEGORY_LABEL_MAP } from "./announcement-category";

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color={colors.mutedForeground} />
      <Text className="text-xs text-muted-foreground w-28">{label}</Text>
      <Text className="flex-1 text-sm text-foreground">{value}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase mb-1 mt-4">
      {children}
    </Text>
  );
}

// Détail partagé par le portail (parents, élèves) et l'espace enseignant : seule la source des données change.
type AnnouncementDetailViewProps = {
  announcement: PortalAnnouncementDTO | undefined;
  isLoading: boolean;
  error: unknown;
  onReload: () => void;
  onMarkAsRead: () => void;
  isMarkingAsRead: boolean;
};

export function AnnouncementDetailView({
  announcement,
  isLoading,
  error,
  onReload,
  onMarkAsRead,
  isMarkingAsRead,
}: AnnouncementDetailViewProps) {
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !announcement) {
    return (
      <View className="flex-1 items-center justify-center px-6 gap-3">
        <Text className="text-sm text-muted-foreground text-center">
          Impossible de charger le communiqué.
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
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
      <View className="flex-row items-center gap-1.5 flex-wrap">
        {announcement.isPinned && (
          <Ionicons name="pin" size={14} color={colors.mutedForeground} />
        )}
        <Text className="text-lg font-bold text-foreground flex-1" numberOfLines={2}>
          {announcement.title}
        </Text>
      </View>

      <View className="flex-row items-center gap-2 mt-2 flex-wrap">
        {announcement.category && (
          <View className="px-2 py-0.5 rounded-full bg-muted">
            <Text className="text-xs font-medium text-gray-600 dark:text-zinc-400">
              {ANNOUNCEMENT_CATEGORY_LABEL_MAP[announcement.category]}
            </Text>
          </View>
        )}

        <View
          className={`px-2 py-0.5 rounded-full ${announcement.isRead ? "bg-green-100 dark:bg-green-900/40" : "bg-amber-100 dark:bg-amber-900/40"}`}
        >
          <Text
            className={`text-xs font-medium ${announcement.isRead ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"}`}
          >
            {announcement.isRead ? "Lu" : "Non lu"}
          </Text>
        </View>
      </View>

      {!announcement.isRead && (
        <Pressable
          onPress={onMarkAsRead}
          disabled={isMarkingAsRead}
          className="flex-row items-center justify-center gap-2 h-11 mt-4 rounded-lg bg-foreground"
        >
          {isMarkingAsRead ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.background} />
          )}
          <Text className="text-background font-medium">
            {isMarkingAsRead ? "En cours..." : "Marquer comme lu"}
          </Text>
        </Pressable>
      )}

      <SectionTitle>Informations</SectionTitle>
      <View className="border-t border-divider pt-1">
        <InfoRow
          icon="calendar-outline"
          label="Publié le"
          value={formatDateTime(announcement.publishedAt)}
        />
        <InfoRow
          icon="hourglass-outline"
          label="Expire le"
          value={announcement.expiresAt ? formatDateTime(announcement.expiresAt) : "—"}
        />
      </View>

      {announcement.body && (
        <View className="mt-2">
          <SectionTitle>Contenu</SectionTitle>
          <Text className="text-sm text-foreground">{announcement.body}</Text>
        </View>
      )}

      {announcement.documents.length > 0 && (
        <View>
          <SectionTitle>Pièces jointes</SectionTitle>
          <View className="border-t border-divider">
            {announcement.documents.map((item) => {
              if (!item.document) return null;
              const name =
                item.document.title ?? item.document.originalName ?? "Sans nom";

              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    if (item.document?.url) {
                      void openBrowserAsync(item.document.url);
                    }
                  }}
                  disabled={!item.document.url}
                  className="flex-row items-center gap-3 py-2.5 border-b border-divider"
                >
                  <Ionicons
                    name={documentIconName(item.document.mimeType)}
                    size={18}
                    color={colors.mutedForeground}
                  />
                  <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
                    {name}
                  </Text>
                  {item.document.url && (
                    <Ionicons name="download-outline" size={18} color={colors.mutedForeground} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
