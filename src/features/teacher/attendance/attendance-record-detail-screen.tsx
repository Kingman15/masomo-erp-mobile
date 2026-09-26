import { getAttendanceBadgeInfo } from "@/features/portal/discipline/attendance/get-attendance-badge-info";
import {
  useDeleteStudentAttendanceRecord,
  useStudentAttendanceRecordById,
} from "@/hooks/queries/items/student-attendance-record";
import { useConfirm } from "@/hooks/use-confirm";
import { handleApiError } from "@/lib/handle-api-error";
import { toastNotify } from "@/lib/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  formatAttendanceDate,
  getEnrollmentLabel,
  getSchoolClassLabel,
  getSessionLabel,
  toHoursMinutes,
} from "./attendance-labels";

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={16} color="#6B7280" />
      <Text className="text-xs text-gray-500 w-28">{label}</Text>
      <Text className="flex-1 text-sm text-black">{value}</Text>
    </View>
  );
}

function yesNo(value: boolean | null) {
  return value ? "Oui" : "Non";
}

export function AttendanceRecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    studentAttendanceRecord: record,
    studentAttendanceRecordIsLoading,
    studentAttendanceRecordError,
    loadStudentAttendanceRecord,
  } = useStudentAttendanceRecordById(id);

  const { deleteStudentAttendanceRecord, deleteStudentAttendanceRecordIsPending } =
    useDeleteStudentAttendanceRecord();
  const { confirm, ConfirmDialog } = useConfirm();

  const handleDelete = async () => {
    if (!record) return;

    const confirmed = await confirm({
      title: "Supprimer le pointage",
      description: `Voulez-vous vraiment supprimer le pointage de ${getEnrollmentLabel(record.enrollment)} ?`,
      confirmText: "Supprimer",
      variant: "destructive",
    });
    if (!confirmed) return;

    try {
      await deleteStudentAttendanceRecord(record.id);
      toastNotify("Pointage de présence supprimé avec succès.", "success");
      router.back();
    } catch (error) {
      handleApiError(error);
    }
  };

  const badge = record ? getAttendanceBadgeInfo(record) : null;
  const entryTime = toHoursMinutes(record?.entryTime);
  const exitTime = toHoursMinutes(record?.exitTime);

  return (
    <>
      <Stack.Screen options={{ title: "Détails du pointage" }} />

      <View className="flex-1 bg-white">
        {studentAttendanceRecordIsLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : studentAttendanceRecordError ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Text className="text-sm text-gray-500 text-center">
              Impossible de charger le pointage de présence.
            </Text>
            <Pressable
              onPress={() => loadStudentAttendanceRecord()}
              className="h-10 px-4 rounded-lg bg-black items-center justify-center"
            >
              <Text className="text-white font-medium">Réessayer</Text>
            </Pressable>
          </View>
        ) : record ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
          >
            {record.session && (
              <Text className="text-xs font-medium text-gray-500 capitalize">
                {formatAttendanceDate(record.session.attendanceDate, "long")}
              </Text>
            )}
            <Text className="text-xl font-semibold text-black mt-1">
              {getEnrollmentLabel(record.enrollment)}
            </Text>
            {badge && (
              <View
                className="self-start rounded-full px-2.5 py-1 mt-2"
                style={{ backgroundColor: badge.bgColor }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: badge.textColor }}
                >
                  {badge.label}
                </Text>
              </View>
            )}

            <View className="mt-4 border-t border-gray-100 pt-1">
              {record.session && (
                <InfoRow
                  icon="calendar-outline"
                  label="Session"
                  value={getSessionLabel(record.session)}
                />
              )}
              {record.enrollment?.schoolClass && (
                <InfoRow
                  icon="people-outline"
                  label="Classe"
                  value={getSchoolClassLabel(record.enrollment.schoolClass)}
                />
              )}
              <InfoRow
                icon="pricetag-outline"
                label="Type de pointage"
                value={record.pointingType?.label ?? "—"}
              />
              <InfoRow
                icon="time-outline"
                label="Arrivée / départ"
                value={`${entryTime ?? "—"} / ${exitTime ?? "—"}`}
              />
              <InfoRow
                icon="alarm-outline"
                label="En retard"
                value={yesNo(record.isLate)}
              />
              <InfoRow
                icon="contrast-outline"
                label="Partiel"
                value={yesNo(record.isPartial)}
              />
            </View>

            <View className="mt-4 border-t border-gray-100 pt-1">
              <InfoRow
                icon="document-text-outline"
                label="Justification"
                value={record.justificationStatus?.label ?? "—"}
              />
              {record.justificationDate && (
                <InfoRow
                  icon="calendar-number-outline"
                  label="Date justif."
                  value={formatAttendanceDate(record.justificationDate, "long")}
                />
              )}
              {record.justificationNote && (
                <InfoRow
                  icon="chatbox-outline"
                  label="Note justif."
                  value={record.justificationNote}
                />
              )}
            </View>

            <View className="mt-4 border-t border-gray-100 pt-1">
              <InfoRow
                icon="radio-outline"
                label="Canal"
                value={record.pointingChannel?.label ?? "—"}
              />
              <InfoRow
                icon="location-outline"
                label="Lieu"
                value={record.location ?? "—"}
              />
              <InfoRow
                icon="person-outline"
                label="Pointé par"
                value={record.pointedByEmployee?.fullName ?? "—"}
              />
            </View>

            {record.note && (
              <View className="mt-4 border-t border-gray-100 pt-3">
                <Text className="text-xs text-gray-500 mb-1">Note</Text>
                <Text className="text-sm text-black">{record.note}</Text>
              </View>
            )}

            <View className="mt-6 gap-3">
              <Pressable
                onPress={() =>
                  router.push(`/teacher/attendance/${record.id}/edit`)
                }
                className="h-12 rounded-lg bg-black items-center justify-center flex-row gap-2"
              >
                <Ionicons name="create-outline" size={18} color="#ffffff" />
                <Text className="text-white font-medium">Modifier</Text>
              </Pressable>

              <Pressable
                onPress={() => void handleDelete()}
                disabled={deleteStudentAttendanceRecordIsPending}
                className="h-12 rounded-lg border border-red-200 items-center justify-center flex-row gap-2"
              >
                {deleteStudentAttendanceRecordIsPending ? (
                  <ActivityIndicator color="#DC2626" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    <Text className="text-red-600 font-medium">Supprimer</Text>
                  </>
                )}
              </Pressable>
            </View>
          </ScrollView>
        ) : null}
      </View>

      <ConfirmDialog />
    </>
  );
}
