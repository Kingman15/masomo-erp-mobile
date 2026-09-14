import { usePortalTransportSubscriptions } from "@/hooks/queries/items/portal-transport-subscription";
import type { TransportSubscription } from "@/utils/types/TransportSubscription";
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
import { TransportSubscriptionRow } from "./transport-subscription-row";

export function SubscriptionsScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && selectedSchoolClass?.id,
  );

  const {
    portalTransportSubscriptions,
    portalTransportSubscriptionsError,
    portalTransportSubscriptionsIsLoading,
    portalTransportSubscriptionsIsFetching,
    loadPortalTransportSubscriptions,
  } = usePortalTransportSubscriptions({
    studentId: selectedStudent?.id,
    filters: {
      schoolYearId: selectedSchoolYear?.id,
      schoolClassId: selectedSchoolClass?.id,
    },
    enabled: filtersAreComplete,
  });

  const handlePressSubscription = (subscription: TransportSubscription) => {
    router.push(`/portal/menu/transport/subscriptions/${subscription.id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Abonnements",
        }}
      />

      <View className="flex-1 bg-gray-50">
        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher ses abonnements de transport.
            </Text>
          </View>
        ) : portalTransportSubscriptionsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalTransportSubscriptionsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les abonnements de transport.
            </Text>
            <Pressable
              onPress={() => loadPortalTransportSubscriptions()}
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
                refreshing={portalTransportSubscriptionsIsFetching}
                onRefresh={() => void loadPortalTransportSubscriptions()}
              />
            }
          >
            {portalTransportSubscriptions.length === 0 ? (
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucun abonnement de transport n&apos;a été enregistré pour cet
                  élève.
                </Text>
              </View>
            ) : (
              portalTransportSubscriptions.map((subscription) => (
                <TransportSubscriptionRow
                  key={subscription.id}
                  subscription={subscription}
                  onPress={handlePressSubscription}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
