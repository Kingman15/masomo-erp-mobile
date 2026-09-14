import { usePortalDocuments } from "@/hooks/queries/items/portal-document";
import type { PortalDocumentDTO } from "@/utils/types/objects/PortalDocumentDTO";
import { Stack, router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { DocumentRow } from "./document-row";

export function DocumentsScreen() {
  const { selectedStudent, selectedSchoolYear } = usePortalSelection();

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id,
  );

  const {
    portalDocuments,
    portalDocumentsError,
    portalDocumentsIsLoading,
    portalDocumentsIsFetching,
    loadPortalDocuments,
  } = usePortalDocuments({
    filters: { schoolYearId: selectedSchoolYear?.id },
    enabled: filtersAreComplete,
  });

  const handlePressDocument = (document: PortalDocumentDTO) => {
    router.push(`/portal/menu/communication/documents/${document.id}`);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Documents partagés" }} />

      <View className="flex-1 bg-white">
        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher les documents partagés.
            </Text>
          </View>
        ) : portalDocumentsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalDocumentsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les documents partagés.
            </Text>
            <Pressable
              onPress={() => loadPortalDocuments()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={portalDocumentsIsFetching}
                onRefresh={() => void loadPortalDocuments()}
              />
            }
          >
            {portalDocuments.length === 0 ? (
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucun document n&apos;a été partagé pour cette année scolaire.
                </Text>
              </View>
            ) : (
              portalDocuments.map((document, index) => (
                <DocumentRow
                  key={document.id}
                  item={document}
                  onPress={handlePressDocument}
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
