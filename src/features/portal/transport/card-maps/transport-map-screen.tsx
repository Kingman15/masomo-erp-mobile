import { useCurrentTransportSubscription } from "@/hooks/queries/items/portal-transport-subscription";
import { useCurrentSchool } from "@/hooks/queries/items/school";
import type { TransportSubscriptionLeg } from "@/utils/types/TransportSubscriptionLeg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { usePortalSelection } from "../../use-portal-selection";
import { lineColor } from "./bus-line-color";
import { buildTransportMapHtml, type TransportMapPayload } from "./transport-map-html";
import { TRANSPORT_SUBSCRIPTION_LEG_DIRECTION_LABEL_MAP } from "./transport-subscription-leg-status";
import { TransportSubscriptionLegStatusPill } from "./transport-subscription-leg-status-pill";

type BusLine = NonNullable<TransportSubscriptionLeg["busLine"]>;

interface StopGroup {
  stopId: string;
  latitude: number;
  longitude: number;
  stopName: string;
  legs: TransportSubscriptionLeg[];
}

// Un même arrêt physique peut servir à l'aller ET au retour : on regroupe les
// legs par busStop.id pour n'afficher qu'un seul marker par arrêt réel.
function groupLegsByStop(legs: TransportSubscriptionLeg[]): StopGroup[] {
  const groups = new Map<string, StopGroup>();
  legs.forEach((leg) => {
    const stop = leg.busStop;
    if (!stop?.id || stop.latitude == null || stop.longitude == null) return;

    const existing = groups.get(stop.id);
    if (existing) {
      existing.legs.push(leg);
      return;
    }

    groups.set(stop.id, {
      stopId: stop.id,
      latitude: stop.latitude,
      longitude: stop.longitude,
      stopName: stop.name ?? "—",
      legs: [leg],
    });
  });
  return Array.from(groups.values());
}

export function TransportMapScreen() {
  const { selectedStudent } = usePortalSelection();

  const { currentSchool, currentSchoolError, loadCurrentSchool } =
    useCurrentSchool();

  const {
    currentTransportSubscription,
    currentTransportSubscriptionIsLoading,
    currentTransportSubscriptionError,
    loadCurrentTransportSubscription,
  } = useCurrentTransportSubscription({
    studentId: selectedStudent?.id,
    enabled: Boolean(selectedStudent),
  });

  const legs = useMemo(
    () => currentTransportSubscription?.legs ?? [],
    [currentTransportSubscription],
  );

  const stopGroups = useMemo(() => groupLegsByStop(legs), [legs]);

  const lines = useMemo(() => {
    const map = new Map<string, BusLine>();
    legs.forEach((leg) => {
      if (leg.busLine) map.set(leg.busLine.id, leg.busLine);
    });
    return Array.from(map.values());
  }, [legs]);

  const schoolPosition = useMemo(() => {
    if (!currentSchool?.latitude || !currentSchool.longitude) return null;
    const latitude = parseFloat(currentSchool.latitude);
    const longitude = parseFloat(currentSchool.longitude);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
    return { lat: latitude, lng: longitude };
  }, [currentSchool]);

  const mapHtml = useMemo(() => {
    const payload: TransportMapPayload = {
      school: schoolPosition,
      lines: lines
        .map((line) => ({
          id: line.id,
          name: line.name ?? "Ligne",
          color: lineColor(line),
          points: (line.polyline ?? [])
            .filter((p) => p.lat != null && p.lng != null)
            .map((p) => [p.lat as number, p.lng as number] as [number, number]),
        }))
        .filter((line) => line.points.length > 1),
      stops: stopGroups.map((group) => {
        const distinctLines = new Set(
          group.legs.map((leg) => leg.busLine?.id).filter(Boolean),
        );
        const color =
          distinctLines.size === 1
            ? lineColor(group.legs[0]?.busLine)
            : "#334155";

        return {
          id: group.stopId,
          lat: group.latitude,
          lng: group.longitude,
          name: group.stopName,
          color,
          directions:
            group.legs.length > 1
              ? group.legs
                  .map((leg) =>
                    leg.direction
                      ? TRANSPORT_SUBSCRIPTION_LEG_DIRECTION_LABEL_MAP[leg.direction]
                      : null,
                  )
                  .filter((label): label is string => Boolean(label))
              : [],
        };
      }),
    };

    return buildTransportMapHtml(payload);
  }, [schoolPosition, lines, stopGroups]);

  const handleRefresh = () => {
    void loadCurrentSchool();
    void loadCurrentTransportSubscription();
  };

  const hasError = Boolean(currentSchoolError || currentTransportSubscriptionError);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Carte Maps" }} />

      <View className="flex-1 bg-white">
        {!selectedStudent ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun élève sélectionné
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Sélectionnez un élève pour afficher sa carte de transport.
            </Text>
          </View>
        ) : currentTransportSubscriptionIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : hasError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger la carte de transport.
            </Text>
            <Pressable
              onPress={handleRefresh}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : legs.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 gap-1">
            <Ionicons
              name="bus-outline"
              size={28}
              color="#9CA3AF"
              style={{ marginBottom: 4 }}
            />
            <Text className="text-sm font-medium text-gray-700 text-center">
              Aucun trajet actif
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              {selectedStudent.fullName ?? "Cet élève"} n&apos;est pas
              inscrit·e au transport scolaire. Contactez l&apos;administration
              pour plus d&apos;informations.
            </Text>
          </View>
        ) : (
          <>
            <View className="flex-1">
              <WebView
                source={{ html: mapHtml }}
                originWhitelist={["*"]}
                scrollEnabled={false}
                style={{ flex: 1 }}
              />
            </View>

            <View className="border-t border-gray-100" style={{ maxHeight: "35%" }}>
              <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Trajets
                </Text>

                <View className="gap-3">
                  {legs.map((leg) => {
                    const directionLabel = leg.direction
                      ? TRANSPORT_SUBSCRIPTION_LEG_DIRECTION_LABEL_MAP[leg.direction]
                      : null;

                    return (
                      <View key={leg.id} className="flex-row items-start gap-3">
                        <View
                          className="w-1 rounded-full self-stretch"
                          style={{ backgroundColor: lineColor(leg.busLine), minHeight: 36 }}
                        />
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 flex-wrap">
                            <Text className="text-sm font-semibold text-gray-900">
                              {leg.busLine?.name ?? "Trajet"}
                            </Text>
                            {directionLabel && (
                              <View className="px-2 py-0.5 rounded-full bg-gray-100">
                                <Text className="text-[10px] font-medium text-gray-600">
                                  {directionLabel}
                                </Text>
                              </View>
                            )}
                            <TransportSubscriptionLegStatusPill status={leg.status} />
                          </View>
                          <View className="flex-row items-center gap-1.5 mt-1">
                            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                            <Text className="text-xs text-gray-400" numberOfLines={1}>
                              {leg.busStop?.name ?? "—"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </>
        )}
      </View>
    </>
  );
}
