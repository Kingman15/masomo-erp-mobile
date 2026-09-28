import { useDocumentById } from "@/hooks/queries/items/document";
import { useThemeColors } from "@/hooks/use-theme-colors";
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
import { documentIconName } from "./document-icon";
import { formatFileSize } from "./format-file-size";

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
      <Text className="text-xs text-muted-foreground w-32">{label}</Text>
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

export function DocumentDetailScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    document: documentItem,
    documentIsLoading,
    documentError,
    loadDocument,
  } = useDocumentById(id);

  return (
    <>
      <Stack.Screen options={{ title: "Détails du document" }} />

      <View className="flex-1 bg-background">
        {documentIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : documentError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger le document.
            </Text>
            <Pressable
              onPress={() => loadDocument()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : documentItem ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-lg bg-muted border border-border items-center justify-center shrink-0">
                <Ionicons
                  name={documentIconName(documentItem.mimeType)}
                  size={22}
                  color={colors.mutedForeground}
                />
              </View>

              <View className="flex-1">
                <Text
                  className="text-lg font-bold text-foreground"
                  numberOfLines={2}
                >
                  {documentItem.title ?? documentItem.originalName ?? "Sans nom"}
                </Text>
                <Text
                  className="text-xs text-muted-foreground mt-0.5"
                  numberOfLines={1}
                >
                  {[
                    documentItem.originalName,
                    formatFileSize(documentItem.size),
                    documentItem.mimeType,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
            </View>

            {documentItem.url && (
              <Pressable
                onPress={() => {
                  if (documentItem.url) void openBrowserAsync(documentItem.url);
                }}
                className="flex-row items-center justify-center gap-2 h-11 mt-4 rounded-lg bg-foreground"
              >
                <Ionicons name="download-outline" size={18} color={colors.background} />
                <Text className="text-background font-medium">
                  Ouvrir / Télécharger
                </Text>
              </Pressable>
            )}

            <SectionTitle>Informations</SectionTitle>
            <View className="border-t border-divider pt-1">
              <InfoRow
                icon="pricetag-outline"
                label="Catégorie"
                value={documentItem.category ?? "—"}
              />
              <InfoRow
                icon="person-outline"
                label="Téléversé par"
                value={documentItem.uploadedByUser?.username ?? "—"}
              />
              <InfoRow
                icon="calendar-outline"
                label="Date"
                value={
                  documentItem.createdAt
                    ? new Date(documentItem.createdAt).toLocaleString("fr-FR")
                    : "—"
                }
              />
            </View>

            {documentItem.description && (
              <View className="mt-2">
                <Text className="text-xs text-muted-foreground mb-1">
                  Description
                </Text>
                <Text className="text-sm text-foreground">
                  {documentItem.description}
                </Text>
              </View>
            )}
          </ScrollView>
        ) : null}
      </View>
    </>
  );
}
