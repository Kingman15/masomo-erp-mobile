import { IncidentStatusPill } from "@/features/teacher/incidents/incident-status-pill";
import { SanctionStatusPill } from "@/features/teacher/sanctions/sanction-status-pill";
import { formatDateTime } from "@/lib/format";
import { usePortalSanction } from "@/hooks/queries/items/student-incident-sanction";
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

export function SanctionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedStudent } = usePortalSelection();

  const {
    portalSanction: sanction,
    portalSanctionIncident: incident,
    portalSanctionIsLoading,
    portalSanctionError,
    loadPortalSanction,
  } = usePortalSanction({ studentId: selectedStudent?.id, sanctionId: id });

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Détail de la sanction" }} />

      <View className="flex-1 bg-white">
        {portalSanctionIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : portalSanctionError || !sanction ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Cette sanction n&apos;est pas accessible.
            </Text>
            <Pressable
              onPress={() => loadPortalSanction()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-xl font-semibold text-black" numberOfLines={1}>
                {sanction.sanctionType ?? "Sanction"}
              </Text>
              <SanctionStatusPill status={sanction.status} />
            </View>

            <SectionTitle>Informations</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow icon="pricetag-outline" label="Type de sanction" value={sanction.sanctionType} />
              <InfoRow icon="document-text-outline" label="Article de règlement" value={sanction.regulationArticle} />
              <InfoRow icon="calendar-outline" label="Décidée le" value={formatDateTime(sanction.decidedAt)} />
              <InfoRow icon="time-outline" label="Début" value={formatDateTime(sanction.startsAt)} />
              <InfoRow icon="time-outline" label="Fin" value={formatDateTime(sanction.endsAt)} />
            </View>

            {sanction.justification && (
              <>
                <SectionTitle>Justification</SectionTitle>
                <Text className="text-sm text-black">{sanction.justification}</Text>
              </>
            )}

            {sanction.isAppealed && sanction.appealNotes && (
              <>
                <SectionTitle>Appel</SectionTitle>
                <Text className="text-sm text-black">{sanction.appealNotes}</Text>
              </>
            )}

            {incident && (
              <>
                <SectionTitle>Incident lié</SectionTitle>
                <View className="rounded-xl border border-gray-100 overflow-hidden">
                  <View className="px-4 py-3">
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="flex-1 text-sm font-medium text-black" numberOfLines={1}>
                        {incident.incidentType ?? "Incident"}
                      </Text>
                      <IncidentStatusPill status={incident.status} />
                    </View>

                    {incident.role && (
                      <Text className="text-xs text-gray-400 mt-0.5">Rôle : {incident.role}</Text>
                    )}

                    <Text className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(incident.occurredAt)}
                      {incident.location ? ` · ${incident.location}` : ""}
                    </Text>

                    {incident.severityLevel && (
                      <Text className="text-xs text-gray-400 mt-0.5">
                        Niveau de gravité : {incident.severityLevel}
                      </Text>
                    )}

                    {incident.parentsNotifiedAt && (
                      <Text className="text-xs text-gray-400 mt-0.5">
                        Parents notifiés le : {formatDateTime(incident.parentsNotifiedAt)}
                      </Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
