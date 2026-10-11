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
import { PortalSelectionEmpty } from "../../portal-selection-empty";

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

      <View className="flex-1 bg-subtle">
        {!studentIsSelected ? (
          <PortalSelectionEmpty subject="ses horaires de transport" requiresClass={false} />
        ) : portalTransportSchedulesIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalTransportSchedulesError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-muted-foreground text-center">
              Impossible de charger les horaires de transport.
            </Text>
            <Pressable
              onPress={() => loadPortalTransportSchedules()}
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
                refreshing={portalTransportSchedulesIsFetching}
                onRefresh={() => void loadPortalTransportSchedules()}
              />
            }
          >
            {portalTransportSchedules.length === 0 ? (
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-faint text-center">
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
