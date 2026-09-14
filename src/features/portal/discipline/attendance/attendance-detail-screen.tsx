import { formatDateTime } from "@/lib/format";
import { useStudentAttendanceRecordById } from "@/hooks/queries/items/student-attendance-record";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

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

function Pill({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean | null;
  activeLabel: string;
  inactiveLabel: string;
}) {
  if (active === null) return null;

  return (
    <View
      className={`rounded-full px-2.5 py-1 ${
        active ? "bg-red-50" : "bg-gray-100"
      }`}
    >
      <Text
        className={`text-xs font-medium ${
          active ? "text-red-700" : "text-gray-600"
        }`}
      >
        {active ? activeLabel : inactiveLabel}
      </Text>
    </View>
  );
}

export function AttendanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    studentAttendanceRecord: record,
    studentAttendanceRecordIsLoading,
    studentAttendanceRecordError,
    loadStudentAttendanceRecord,
  } = useStudentAttendanceRecordById(id);

  const session = record?.session;
  const register = session?.register;
  const enrollment = record?.enrollment;

  const hasJustificationInfo = Boolean(
    record?.justificationStatus ?? record?.justificationDate ?? record?.justificationNote,
  );
  const hasOtherInfo = Boolean(record?.note);

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: "Détail du pointage" }}
      />

      <View className="flex-1 bg-white">
        {studentAttendanceRecordIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : studentAttendanceRecordError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Ce pointage n&apos;est pas accessible.
            </Text>
            <Pressable
              onPress={() => loadStudentAttendanceRecord()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : record ? (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row items-center gap-2">
              <Pill
                active={record.isLate}
                activeLabel="En retard"
                inactiveLabel="À l'heure"
              />
              <Pill
                active={record.isPartial}
                activeLabel="Présence partielle"
                inactiveLabel="Présence complète"
              />
            </View>

            <SectionTitle>Informations principales</SectionTitle>
            <View className="border-t border-gray-100 pt-1">
              <InfoRow icon="calendar-outline" label="Année scolaire" value={register?.schoolYear?.title} />
              <InfoRow icon="book-outline" label="Registre" value={register?.title} />
              <InfoRow icon="today-outline" label="Session" value={session?.title} />
              <InfoRow icon="person-outline" label="Élève" value={enrollment?.student?.fullDesignation} />
              <InfoRow icon="checkbox-outline" label="Type de pointage" value={record.pointingType?.label} />
              <InfoRow icon="person-circle-outline" label="Pointé par" value={record.pointedByEmployee?.fullName} />
              <InfoRow icon="log-in-outline" label="Heure d'arrivée" value={record.entryTime} />
              <InfoRow icon="log-out-outline" label="Heure de départ" value={record.exitTime} />
              <InfoRow icon="time-outline" label="Pointage d'entrée" value={formatDateTime(record.entryPointedAt as string | null)} />
              <InfoRow icon="time-outline" label="Pointage de sortie" value={formatDateTime(record.exitPointedAt as string | null)} />
              <InfoRow icon="radio-outline" label="Canal" value={record.pointingChannel?.label} />
              <InfoRow icon="location-outline" label="Lieu" value={record.location} />
            </View>

            {hasJustificationInfo && (
              <>
                <SectionTitle>Justification</SectionTitle>
                <View className="border-t border-gray-100 pt-1">
                  <InfoRow icon="shield-checkmark-outline" label="Statut" value={record.justificationStatus?.label} />
                  <InfoRow icon="calendar-outline" label="Date" value={formatDateTime(record.justificationDate as string | null)} />
                </View>
                {record.justificationNote && (
                  <Text className="text-sm text-black mt-2">
                    {record.justificationNote}
                  </Text>
                )}
              </>
            )}

            {hasOtherInfo && (
              <>
                <SectionTitle>Autres</SectionTitle>
                <Text className="text-sm text-black">{record.note}</Text>
              </>
            )}
          </ScrollView>
        ) : null}
      </View>
    </>
  );
}
