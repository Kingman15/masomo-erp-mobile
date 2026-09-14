import { IncidentStatusPill } from "@/features/teacher/incidents/incident-status-pill";
import { SanctionStatusPill } from "@/features/teacher/sanctions/sanction-status-pill";
import { formatDateTime } from "@/lib/format";
import { usePortalIncident } from "@/hooks/queries/items/student-incident";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { usePortalSelection } from "../../use-portal-selection";

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

export function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedStudent } = usePortalSelection();

  const {
    portalIncident: incident,
    portalIncidentSanctions: sanctions,
    portalIncidentIsLoading,
    portalIncidentError,
    loadPortalIncident,
  } = usePortalIncident({ studentId: selectedStudent?.id, incidentId: id });

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Détail de l'incident" }} />

      <View className="flex-1 bg-white">
        {portalIncidentIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalIncidentError || !incident ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Cet incident n&apos;est pas accessible.
            </Text>
            <Pressable
              onPress={() => loadPortalIncident()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-xl font-semibold text-black" numberOfLines={1}>
                {incident.incidentType ?? "Incident"}
              </Text>
              <IncidentStatusPill status={incident.status} />
            </View>

            <SectionTitle>Informations</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow icon="pricetag-outline" label="Type d'incident" value={incident.incidentType} />
              <InfoRow icon="person-outline" label="Rôle" value={incident.role} />
              <InfoRow icon="time-outline" label="Date" value={formatDateTime(incident.occurredAt)} />
              <InfoRow icon="location-outline" label="Lieu" value={incident.location} />
              <InfoRow icon="alert-circle-outline" label="Niveau de gravité" value={incident.severityLevel} />
              {incident.parentsNotifiedAt && (
                <InfoRow
                  icon="notifications-outline"
                  label="Parents notifiés le"
                  value={formatDateTime(incident.parentsNotifiedAt)}
                />
              )}
            </View>

            <SectionTitle>Sanctions</SectionTitle>
            {sanctions.length > 0 ? (
              <View className="rounded-xl border border-gray-100 overflow-hidden">
                {sanctions.map((sanction, index) => (
                  <View
                    key={sanction.id}
                    className={`px-4 py-3 ${index > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="flex-1 text-sm font-medium text-black" numberOfLines={1}>
                        {sanction.sanctionType ?? "Sanction"}
                      </Text>
                      <SanctionStatusPill status={sanction.status} />
                    </View>

                    {sanction.regulationArticle && (
                      <Text className="text-xs text-gray-400 mt-0.5">
                        Article : {sanction.regulationArticle}
                      </Text>
                    )}

                    <Text className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(sanction.startsAt)}
                      {sanction.endsAt ? ` → ${formatDateTime(sanction.endsAt)}` : ""}
                    </Text>

                    {sanction.justification && (
                      <Text className="text-sm text-black mt-2">
                        {sanction.justification}
                      </Text>
                    )}

                    {sanction.isAppealed && sanction.appealNotes && (
                      <Text className="text-xs text-gray-500 mt-1">
                        Appel : {sanction.appealNotes}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-gray-400">
                Aucune sanction n&apos;est liée à cet incident.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
