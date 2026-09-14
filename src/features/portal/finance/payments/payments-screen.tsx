import { usePortalFeePayments } from "@/hooks/queries/items/fee-payment";
import type { PortalFeePaymentDTO } from "@/utils/types/objects/PortalFeePaymentDTO";
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
import { FeePaymentRow } from "./fee-payment-row";

export function PaymentsScreen() {
  const { selectedStudent, selectedSchoolYear, selectedSchoolClass } =
    usePortalSelection();

  const filtersAreComplete = Boolean(
    selectedStudent?.id && selectedSchoolYear?.id && selectedSchoolClass?.id,
  );

  const {
    portalFeePayments,
    portalFeePaymentsError,
    portalFeePaymentsIsLoading,
    portalFeePaymentsIsFetching,
    loadPortalFeePayments,
  } = usePortalFeePayments({
    studentId: selectedStudent?.id,
    filters: {
      schoolYearId: selectedSchoolYear?.id,
      schoolClassId: selectedSchoolClass?.id,
    },
    enabled: filtersAreComplete,
  });

  const handlePressFeePayment = (feePayment: PortalFeePaymentDTO) => {
    router.push(`/portal/menu/finance/payments/${feePayment.id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Paiements",
        }}
      />

      <View className="flex-1 bg-gray-50">
        {!filtersAreComplete ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher ses paiements.
            </Text>
          </View>
        ) : portalFeePaymentsIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalFeePaymentsError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger les paiements.
            </Text>
            <Pressable
              onPress={() => loadPortalFeePayments()}
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
                refreshing={portalFeePaymentsIsFetching}
                onRefresh={() => void loadPortalFeePayments()}
              />
            }
          >
            {portalFeePayments.length === 0 ? (
              <View className="items-center justify-center px-6 py-16">
                <Text className="text-sm text-gray-400 text-center">
                  Aucun paiement de frais n&apos;a été enregistré pour cet élève.
                </Text>
              </View>
            ) : (
              portalFeePayments.map((feePayment) => (
                <FeePaymentRow
                  key={feePayment.id}
                  feePayment={feePayment}
                  onPress={handlePressFeePayment}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
