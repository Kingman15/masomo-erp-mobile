import { usePortalSanctions } from "@/hooks/queries/items/student-incident-sanction";
import { PortalSanctionDTO } from "@/utils/types/objects/PortalSanctionDTO";
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
import { SanctionRow } from "./sanction-row";

export function SanctionsScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && selectedSchoolClass?.id,
  );

  const {
    portalSanctions = [],
    portalSanctionsError,
    portalSanctionsIsLoading,
    portalSanctionsIsFetching,
    loadPortalSanctions,
  } = usePortalSanctions({
    studentId: selectedStudent?.id,
    filters: {
      schoolYearId: selectedSchoolYear?.id,
      schoolClassId: selectedSchoolClass?.id,
    },
    enabled: filtersAreComplete,
  });

  const handlePressSanction = (sanction: PortalSanctionDTO) => {
    router.push(`/portal/menu/discipline/sanctions/${sanction.id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Sanctions",
        }}
      />

      <View className="flex-1 bg-background">
        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-foreground-secondary text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-faint text-center">
              Sélectionnez un élève pour afficher ses sanctions.
            </Text>
          </View>
        ) : portalSanctionsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalSanctionsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger les sanctions.
            </Text>
            <Pressable
              onPress={() => loadPortalSanctions()}
              className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
            >
              <Text className="text-background font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={portalSanctionsIsFetching}
                onRefresh={() => void loadPortalSanctions()}
              />
            }
          >
            {portalSanctions.length === 0 ? (
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-faint text-center">
                  Aucune sanction n&apos;a été enregistrée pour cet élève.
                </Text>
              </View>
            ) : (
              portalSanctions.map((sanction) => (
                <SanctionRow
                  key={sanction.id}
                  sanction={sanction}
                  onPress={handlePressSanction}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
