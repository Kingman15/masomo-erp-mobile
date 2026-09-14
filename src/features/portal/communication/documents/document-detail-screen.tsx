import { documentIconName } from "@/features/teacher/documents/document-icon";
import { formatFileSize } from "@/features/teacher/documents/format-file-size";
import { usePortalDocument } from "@/hooks/queries/items/portal-document";
import { formatDateTime } from "@/lib/format";
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

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color="#6B7280" />
      <Text className="text-xs text-gray-500 w-32">{label}</Text>
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

export function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedSchoolYear } = usePortalSelection();

  const {
    portalDocument: documentItem,
    portalDocumentIsLoading,
    portalDocumentError,
    loadPortalDocument,
  } = usePortalDocument({ schoolYearId: selectedSchoolYear?.id, documentId: id });

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Détails du document" }} />

      <View className="flex-1 bg-white">
        {portalDocumentIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalDocumentError || !documentItem ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger le document.
            </Text>
            <Pressable
              onPress={() => loadPortalDocument()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 items-center justify-center shrink-0">
                <Ionicons
                  name={documentIconName(documentItem.mimeType)}
                  size={22}
                  color="#6B7280"
                />
              </View>

              <View className="flex-1">
                <Text className="text-lg font-bold text-black" numberOfLines={2}>
                  {documentItem.title ?? documentItem.originalName ?? "Sans nom"}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
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
                className="flex-row items-center justify-center gap-2 h-11 mt-4 rounded-lg bg-black"
              >
                <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                <Text className="text-white font-medium">Ouvrir / Télécharger</Text>
              </Pressable>
            )}

            <SectionTitle>Informations</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow
                icon="pricetag-outline"
                label="Catégorie"
                value={documentItem.category ?? "—"}
              />
              <InfoRow
                icon="calendar-outline"
                label="Partagé le"
                value={formatDateTime(documentItem.createdAt)}
              />
            </View>

            {documentItem.description && (
              <View className="mt-2">
                <Text className="text-xs text-gray-500 mb-1">Description</Text>
                <Text className="text-sm text-black">{documentItem.description}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
