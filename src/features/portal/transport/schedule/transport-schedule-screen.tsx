import { usePortalTransportSchedules } from "@/hooks/queries/items/portal-transport-schedule";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import { TransportScheduleRow } from "./transport-schedule-row";

export function TransportScheduleScreen() {
  const { selectedStudent } = usePortalSelection();

  const studentIsSelected = Boolean(selectedStudent?.id);

  const {
    portalTransportSchedules,
    portalTransportSchedulesError,
    portalTransportSchedulesIsLoading,
    portalTransportSchedulesIsFetching,
    loadPortalTransportSchedules,
  } = usePortalTransportSchedules({
    studentId: selectedStudent?.id,
    enabled: studentIsSelected,
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Horaires",
        }}
      />

      <View className="flex-1 bg-gray-50">
        {!studentIsSelected ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher ses horaires de transport.
            </Text>
          </View>
        ) : portalTransportSchedulesIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalTransportSchedulesError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les horaires de transport.
            </Text>
            <Pressable
              onPress={() => loadPortalTransportSchedules()}
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
                refreshing={portalTransportSchedulesIsFetching}
                onRefresh={() => void loadPortalTransportSchedules()}
              />
            }
          >
            {portalTransportSchedules.length === 0 ? (
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucun horaire de transport n&apos;a été trouvé pour cet élève.
                </Text>
              </View>
            ) : (
              portalTransportSchedules.map((schedule) => (
                <TransportScheduleRow key={schedule.id} schedule={schedule} />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
