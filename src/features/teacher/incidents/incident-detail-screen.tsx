import { formatDateTime, formatShortDate } from "@/lib/format";
import { useStudentIncidentById } from "@/hooks/queries/items/student-incident";
import { INCIDENT_STUDENT_ROLE_LABELS } from "@/utils/types/IncidentStudent";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SanctionStatusPill } from "../sanctions/sanction-status-pill";
import { IncidentStatusPill } from "./incident-status-pill";

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

function yesNo(value: boolean | null | undefined): string {
  return value ? "Oui" : "Non";
}

export function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    studentIncident,
    studentIncidentIsLoading,
    studentIncidentError,
    loadStudentIncident,
  } = useStudentIncidentById(id);

  const incident = studentIncident;
  const incidentStudents = incident?.incidentStudents ?? [];
  const sanctions = incident?.sanctions ?? [];

  const involvedStudentsLabel = incident
    ? incidentStudents
        .map((incidentStudent) => incidentStudent.student?.fullName)
        .filter((name): name is string => Boolean(name))
        .join(", ") ||
      incident.mainStudent?.fullDesignation ||
      "Élève"
    : "";

  return (
    <>
      <Stack.Screen options={{ title: "Détail de l'incident" }} />

      <View className="flex-1 bg-white">
        {studentIncidentIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : studentIncidentError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger l&apos;incident.
            </Text>
            <Pressable
              onPress={() => loadStudentIncident()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : incident ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="flex-1 text-xl font-semibold text-black"
                numberOfLines={1}
              >
                {involvedStudentsLabel}
              </Text>
              <IncidentStatusPill status={incident.status} />
            </View>
            <Text className="text-sm text-gray-500 mt-0.5">
              {incident.incidentType?.name ?? "—"}
            </Text>

            <SectionTitle>Informations principales</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow
                icon="pricetag-outline"
                label="Code"
                value={incident.code ?? "—"}
              />
              <InfoRow
                icon="time-outline"
                label="Date de survenance"
                value={formatDateTime(incident.occurredAt)}
              />
              <InfoRow
                icon="calendar-outline"
                label="Date de signalement"
                value={formatDateTime(incident.reportedAt)}
              />
              <InfoRow
                icon="location-outline"
                label="Lieu"
                value={incident.location ?? "—"}
              />
              <InfoRow
                icon="alert-circle-outline"
                label="Gravité"
                value={
                  incident.severityLevel != null
                    ? `${incident.severityLevel} / 5`
                    : "—"
                }
              />
              <InfoRow
                icon="person-circle-outline"
                label="Signalé par"
                value={incident.reportedByEmployee?.fullDesignation ?? "—"}
              />
            </View>

            {incident.description && (
              <View className="mt-2">
                <Text className="text-xs text-gray-500 mb-1">Description</Text>
                <Text className="text-sm text-black">
                  {incident.description}
                </Text>
              </View>
            )}

            {incident.mainStudent && (
              <>
                <SectionTitle>Élève principal</SectionTitle>
                <View className="border-t border-gray-100 pt-1">
                  <InfoRow
                    icon="person-outline"
                    label="Élève"
                    value={incident.mainStudent.fullDesignation ?? "—"}
                  />
                </View>
              </>
            )}

            {incidentStudents.length > 0 && (
              <>
                <SectionTitle>Élèves concernés</SectionTitle>
                <View className="border-t border-gray-100 pt-1">
                  {incidentStudents.map((incidentStudent) => (
                    <InfoRow
                      key={incidentStudent.id}
                      icon="people-outline"
                      label={
                        incidentStudent.role
                          ? INCIDENT_STUDENT_ROLE_LABELS[incidentStudent.role]
                          : "—"
                      }
                      value={
                        incidentStudent.student?.fullDesignation ??
                        (incidentStudent.notes
                          ? `— (${incidentStudent.notes})`
                          : "—")
                      }
                    />
                  ))}
                </View>
              </>
            )}

            <SectionTitle>Suivi</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow
                icon="person-circle-outline"
                label="Pris en charge par"
                value={incident.handledByEmployee?.fullDesignation ?? "—"}
              />
              <InfoRow
                icon="shield-checkmark-outline"
                label="Mesure temporaire"
                value={yesNo(incident.temporaryMeasureApplied)}
              />
              {incident.temporaryMeasureApplied &&
                incident.temporaryMeasureDescription && (
                  <InfoRow
                    icon="document-text-outline"
                    label="Description mesure"
                    value={incident.temporaryMeasureDescription}
                  />
                )}
              {incident.measuresTaken && (
                <InfoRow
                  icon="checkmark-done-outline"
                  label="Mesures prises"
                  value={incident.measuresTaken}
                />
              )}
            </View>

            <SectionTitle>Soutien psychologique</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow
                icon="heart-outline"
                label="Requis"
                value={yesNo(incident.psychologicalSupportRequired)}
              />
              {incident.psychologicalSupportRequired &&
                incident.psychologicalSupportNotes && (
                  <InfoRow
                    icon="document-text-outline"
                    label="Notes"
                    value={incident.psychologicalSupportNotes}
                  />
                )}
            </View>

            <SectionTitle>Notification des parents</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow
                icon="notifications-outline"
                label="Parents notifiés"
                value={yesNo(incident.parentsNotified)}
              />
              {incident.parentsNotified && (
                <>
                  <InfoRow
                    icon="calendar-outline"
                    label="Date de notification"
                    value={formatDateTime(incident.parentsNotifiedAt)}
                  />
                  <InfoRow
                    icon="person-outline"
                    label="Notifié par"
                    value={
                      incident.parentsNotifiedByEmployee?.fullDesignation ?? "—"
                    }
                  />
                </>
              )}
            </View>

            {sanctions.length > 0 && (
              <>
                <View className="flex-row items-center gap-1.5 mt-4 mb-1.5">
                  <Ionicons name="warning-outline" size={14} color="#B45309" />
                  <Text className="text-xs font-semibold text-amber-700 uppercase">
                    Sanctions liées
                  </Text>
                </View>
                <View className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
                  {sanctions.map((sanction, index) => (
                    <Pressable
                      key={sanction.id}
                      onPress={() =>
                        router.push(`/teacher/incidents/sanction/${sanction.id}`)
                      }
                      className={`px-4 py-3 ${
                        index > 0 ? "border-t border-amber-200" : ""
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className="flex-1 text-base font-semibold text-black"
                          numberOfLines={1}
                        >
                          {sanction.sanctionType?.name ?? "—"}
                        </Text>
                        <SanctionStatusPill status={sanction.status} />
                      </View>
                      {sanction.regulationArticle?.title && (
                        <Text
                          className="text-xs text-gray-600 mt-0.5"
                          numberOfLines={1}
                        >
                          {sanction.regulationArticle.title}
                        </Text>
                      )}
                      {(sanction.startsAt || sanction.endsAt) && (
                        <View className="flex-row items-center gap-1 mt-2">
                          <Ionicons
                            name="calendar-outline"
                            size={13}
                            color="#92400E"
                          />
                          <Text className="text-xs text-amber-800">
                            {formatShortDate(sanction.startsAt)}
                            {" - "}
                            {formatShortDate(sanction.endsAt)}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {incident.internalNotes && (
              <View className="mt-4">
                <Text className="text-xs text-gray-500 mb-1">
                  Notes internes
                </Text>
                <Text className="text-sm text-black">
                  {incident.internalNotes}
                </Text>
              </View>
            )}
          </ScrollView>
        ) : null}
      </View>
    </>
  );
}
