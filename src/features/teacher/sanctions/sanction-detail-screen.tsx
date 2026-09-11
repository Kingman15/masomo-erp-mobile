import { formatDateTime } from "@/lib/format";
import { useStudentIncidentSanctionById } from "@/hooks/queries/items/student-incident-sanction";
import type { StudentIncidentStatus } from "@/utils/types/StudentIncident";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SanctionStatusPill } from "./sanction-status-pill";

const INCIDENT_STATUS_LABELS: Record<StudentIncidentStatus, string> = {
  open: "Ouvert",
  under_review: "En cours d'examen",
  escalated: "Escaladé",
  resolved: "Résolu",
  closed: "Clôturé",
};

function formatIncidentStatus(status: StudentIncidentStatus | null): string {
  if (!status) return "—";
  return INCIDENT_STATUS_LABELS[status] ?? status;
}

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
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
  const {
    studentIncidentSanction,
    studentIncidentSanctionIsLoading,
    studentIncidentSanctionError,
    loadStudentIncidentSanction,
  } = useStudentIncidentSanctionById(id);

  const sanction = studentIncidentSanction;
  const incident = sanction?.incident ?? null;

  return (
    <>
      <Stack.Screen options={{ title: "Détail de la sanction" }} />

      <View className="flex-1 bg-white">
        {studentIncidentSanctionIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : studentIncidentSanctionError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger la sanction.
            </Text>
            <Pressable
              onPress={() => loadStudentIncidentSanction()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : sanction ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="flex-1 text-xl font-semibold text-black"
                numberOfLines={1}
              >
                {sanction.student?.fullDesignation ?? "Élève"}
              </Text>
              <SanctionStatusPill status={sanction.status} />
            </View>
            <Text className="text-sm text-gray-500 mt-0.5">
              {sanction.sanctionType?.name ?? "—"}
            </Text>

            {incident && (
              <>
                <SectionTitle>Incident lié</SectionTitle>
                <View className="border-t border-gray-100 pt-1">
                  <InfoRow
                    icon="pricetag-outline"
                    label="Code"
                    value={incident.code ?? "—"}
                  />
                  <InfoRow
                    icon="alert-circle-outline"
                    label="Type d'incident"
                    value={incident.incidentType?.name ?? "—"}
                  />
                  <InfoRow
                    icon="information-circle-outline"
                    label="Statut de l'incident"
                    value={formatIncidentStatus(incident.status)}
                  />
                  <InfoRow
                    icon="time-outline"
                    label="Date de survenance"
                    value={formatDateTime(incident.occurredAt)}
                  />
                  <InfoRow
                    icon="location-outline"
                    label="Lieu"
                    value={incident.location ?? "—"}
                  />
                </View>
                {incident.description && (
                  <View className="mt-2">
                    <Text className="text-xs text-gray-500 mb-1">
                      Description
                    </Text>
                    <Text className="text-sm text-black">
                      {incident.description}
                    </Text>
                  </View>
                )}
              </>
            )}

            <SectionTitle>Informations principales</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow
                icon="person-outline"
                label="Élève concerné"
                value={sanction.student?.fullDesignation ?? "—"}
              />
              <InfoRow
                icon="shield-outline"
                label="Type de sanction"
                value={sanction.sanctionType?.name ?? "—"}
              />
              <InfoRow
                icon="document-text-outline"
                label="Article violé"
                value={sanction.regulationArticle?.title ?? "—"}
              />
              <InfoRow
                icon="person-circle-outline"
                label="Décision prise par"
                value={sanction.decidedByEmployee?.fullDesignation ?? "—"}
              />
              <InfoRow
                icon="calendar-outline"
                label="Date décision"
                value={formatDateTime(sanction.decidedAt)}
              />
              <InfoRow
                icon="play-outline"
                label="Début de la sanction"
                value={formatDateTime(sanction.startsAt)}
              />
              <InfoRow
                icon="stop-outline"
                label="Fin de la sanction"
                value={formatDateTime(sanction.endsAt)}
              />
            </View>

            {(sanction.justification || sanction.notes) && (
              <>
                <SectionTitle>Détails</SectionTitle>
                {sanction.justification && (
                  <View className="mb-3">
                    <Text className="text-xs text-gray-500 mb-1">
                      Justification
                    </Text>
                    <Text className="text-sm text-black">
                      {sanction.justification}
                    </Text>
                  </View>
                )}
                {sanction.notes && (
                  <View>
                    <Text className="text-xs text-gray-500 mb-1">Notes</Text>
                    <Text className="text-sm text-black">
                      {sanction.notes}
                    </Text>
                  </View>
                )}
              </>
            )}

            <SectionTitle>Appel</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow
                icon="git-branch-outline"
                label="Appel"
                value={sanction.isAppealed ? "Oui" : "Non"}
              />
              {sanction.isAppealed && (
                <InfoRow
                  icon="calendar-outline"
                  label="Date d'appel"
                  value={formatDateTime(sanction.appealedAt)}
                />
              )}
            </View>
            {sanction.isAppealed && sanction.appealNotes && (
              <View className="mt-2">
                <Text className="text-xs text-gray-500 mb-1">
                  Notes d&apos;appel
                </Text>
                <Text className="text-sm text-black">
                  {sanction.appealNotes}
                </Text>
              </View>
            )}

            <SectionTitle>Notification des parents</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow
                icon="notifications-outline"
                label="Parents notifiés"
                value={sanction.parentsNotified ? "Oui" : "Non"}
              />
              {sanction.parentsNotified && (
                <>
                  <InfoRow
                    icon="calendar-outline"
                    label="Date de notification"
                    value={formatDateTime(sanction.parentsNotifiedAt)}
                  />
                  <InfoRow
                    icon="person-outline"
                    label="Notifié par"
                    value={
                      sanction.parentsNotifiedByEmployee?.fullDesignation ??
                      "—"
                    }
                  />
                </>
              )}
            </View>
          </ScrollView>
        ) : null}
      </View>
    </>
  );
}
