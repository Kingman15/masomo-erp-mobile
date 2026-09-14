import { usePortalTransportSubscription } from "@/hooks/queries/items/portal-transport-subscription";
import { formatCurrency, formatDateTime, formatShortDate } from "@/lib/format";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { usePortalSelection } from "../../use-portal-selection";
import {
  TRANSPORT_SUBSCRIPTION_LEG_DIRECTION_LABEL_MAP,
  TRANSPORT_SUBSCRIPTION_STATUS_LABEL_MAP,
} from "./transport-subscription-status";
import { TransportSubscriptionStatusPill } from "./transport-subscription-status-pill";

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null | undefined;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  if (!value) return null;

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

export function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedStudent } = usePortalSelection();

  const {
    portalTransportSubscription: subscription,
    portalTransportSubscriptionIsLoading,
    portalTransportSubscriptionError,
    loadPortalTransportSubscription,
  } = usePortalTransportSubscription({
    studentId: selectedStudent?.id,
    subscriptionId: id,
  });

  const amount = subscription
    ? (subscription.overrideAmount ?? subscription.pricingPlan?.baseAmount ?? null)
    : null;
  const currency = subscription?.pricingPlan?.currency ?? "USD";
  const legs = subscription?.legs ?? [];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Abonnement de transport" }} />

      <View className="flex-1 bg-white">
        {portalTransportSubscriptionIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalTransportSubscriptionError || !subscription ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Cet abonnement n&apos;est pas accessible.
            </Text>
            <Pressable
              onPress={() => loadPortalTransportSubscription()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 text-xl font-semibold text-black" numberOfLines={2}>
                {subscription.shift?.name ?? "Vacation"}
              </Text>
              <TransportSubscriptionStatusPill status={subscription.status} />
            </View>

            <SectionTitle>Informations</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow
                icon="pricetag-outline"
                label="Formule"
                value={subscription.pricingPlan?.name}
              />
              <InfoRow
                icon="cash-outline"
                label="Tarif"
                value={amount !== null ? formatCurrency(amount, currency) : null}
              />
              <InfoRow
                icon="calendar-outline"
                label="Période"
                value={`${formatShortDate(subscription.startDate)} → ${formatShortDate(subscription.endDate)}`}
              />
              <InfoRow
                icon="time-outline"
                label="Demandé le"
                value={formatDateTime(subscription.requestedAt)}
              />
              <InfoRow
                icon="checkmark-circle-outline"
                label="Approuvé le"
                value={formatDateTime(subscription.approvedAt)}
              />
              <InfoRow
                icon="person-outline"
                label="Approuvé par"
                value={subscription.approvedByEmployee?.fullDesignation}
              />
            </View>

            {subscription.note && (
              <>
                <SectionTitle>Note</SectionTitle>
                <Text className="text-sm text-black">{subscription.note}</Text>
              </>
            )}

            <SectionTitle>Trajets</SectionTitle>
            {legs.length > 0 ? (
              <View className="gap-3">
                {legs.map((leg) => {
                  const directionLabel = leg.direction
                    ? TRANSPORT_SUBSCRIPTION_LEG_DIRECTION_LABEL_MAP[leg.direction]
                    : null;

                  return (
                    <View key={leg.id} className="rounded-xl border border-gray-100 px-4 py-3">
                      <View className="flex-row items-center justify-between gap-3">
                        <Text className="flex-1 text-sm font-medium text-black" numberOfLines={1}>
                          {leg.busLine?.name ?? "Trajet"}
                        </Text>
                        {leg.status && (
                          <View className="px-2 py-0.5 rounded-full bg-gray-100">
                            <Text className="text-[10px] font-medium text-gray-600">
                              {TRANSPORT_SUBSCRIPTION_STATUS_LABEL_MAP[leg.status]}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View className="flex-row items-center gap-1.5 mt-1">
                        <Text className="text-xs text-gray-400">
                          {directionLabel ?? "—"}
                          {leg.busStop?.name ? ` · ${leg.busStop.name}` : ""}
                        </Text>
                      </View>

                      <Text className="text-xs text-gray-400 mt-1">
                        {formatShortDate(leg.startDate)} → {formatShortDate(leg.endDate)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text className="text-sm text-gray-400">
                Aucun trajet n&apos;est associé à cet abonnement.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
