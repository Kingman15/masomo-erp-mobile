import { usePortalIncidents } from "@/hooks/queries/items/student-incident";
import { PortalIncidentDTO } from "@/utils/types/objects/PortalIncidentDTO";
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
import { IncidentRow } from "./incident-row";

export function IncidentsScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && selectedSchoolClass?.id,
  );

  const {
    portalIncidents = [],
    portalIncidentsError,
    portalIncidentsIsLoading,
    portalIncidentsIsFetching,
    loadPortalIncidents,
  } = usePortalIncidents({
    studentId: selectedStudent?.id,
    filters: {
      schoolYearId: selectedSchoolYear?.id,
      schoolClassId: selectedSchoolClass?.id,
    },
    enabled: filtersAreComplete,
  });

  const handlePressIncident = (incident: PortalIncidentDTO) => {
    router.push(`/portal/menu/discipline/incidents/${incident.id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Incidents",
        }}
      />

      <View className="flex-1 bg-white">
        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher ses incidents.
            </Text>
          </View>
        ) : portalIncidentsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalIncidentsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les incidents.
            </Text>
            <Pressable
              onPress={() => loadPortalIncidents()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={portalIncidentsIsFetching}
                onRefresh={() => void loadPortalIncidents()}
              />
            }
          >
            {portalIncidents.length === 0 ? (
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucun incident n&apos;a été enregistré pour cet élève.
                </Text>
              </View>
            ) : (
              portalIncidents.map((incident) => (
                <IncidentRow
                  key={incident.id}
                  incident={incident}
                  onPress={handlePressIncident}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
