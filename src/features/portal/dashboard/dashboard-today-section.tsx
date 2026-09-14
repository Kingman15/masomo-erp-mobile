import { formatShortDate } from "@/lib/format";
import { PortalDashboardToday } from "@/utils/types/PortalDashboardToday";
import { ActivityIndicator, Text, View } from "react-native";
import { StatBox } from "./stat-box";

const attendanceStatusLabels: Record<string, string> = {
  present: "Présent",
  absent: "Absent",
  partial: "Partiel",
};

const sessionAttendanceStatusLabels: Record<string, string> = {
  present: "Présent",
  absent: "Absent",
  late: "En retard",
  excused: "Excusé",
};

type DashboardTodaySectionProps = {
  today: PortalDashboardToday | undefined;
  loading: boolean;
};

export function DashboardTodaySection({ today, loading }: DashboardTodaySectionProps) {
  if (loading || !today) {
    return (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    );
  }

  const hasSchedule = (today.schedule?.length ?? 0) > 0;
  const hasEvaluations = (today.evaluations?.length ?? 0) > 0;
  const hasAttendance = Boolean(today.attendance?.status);

  if (!today.isSchoolDay && !hasSchedule && !hasEvaluations && !hasAttendance) {
    return (
      <Text className="text-sm text-gray-400 py-2.5">
        Aucune information à afficher pour aujourd'hui.
      </Text>
    );
  }

  return (
    <View className="gap-3">
      <View>
        <Text className="text-sm font-medium text-black">
          {formatShortDate(today.date)}
        </Text>
        <Text className="text-xs text-gray-400">
          {today.isSchoolDay ? "Journée scolaire" : "Pas de cours aujourd'hui"}
        </Text>
      </View>

      <View className="flex-row py-1">
        <StatBox
          label="Présence"
          value={
            today.attendance?.status
              ? (attendanceStatusLabels[today.attendance.status] ?? "—")
              : "—"
          }
        />
        <StatBox label="Cours" value={String(today.schedule?.length ?? 0)} />
      </View>

      <View>
        <Text className="text-xs font-semibold text-gray-500 mb-1">Cours du jour</Text>
        {hasSchedule ? (
          (today.schedule ?? []).map((session, index) => (
            <View
              key={index}
              className={`py-2 ${index > 0 ? "border-t border-gray-100" : ""}`}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-black flex-1" numberOfLines={1}>
                  {session.courseName ?? "Cours"}
                </Text>
                <View className="px-2 py-0.5 rounded-full bg-gray-100">
                  <Text className="text-[10px] font-medium text-gray-600">
                    {session.attendanceStatus
                      ? (sessionAttendanceStatusLabels[session.attendanceStatus] ?? "—")
                      : "—"}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-gray-400 mt-0.5">
                {session.startsAt && session.endsAt
                  ? `${session.startsAt} - ${session.endsAt}`
                  : "Horaire à préciser"}
                {session.roomName ? ` · ${session.roomName}` : ""}
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-sm text-gray-400 py-1">
            Aucun cours prévu pour cette journée.
          </Text>
        )}
      </View>

      <View>
        <Text className="text-xs font-semibold text-gray-500 mb-1">Évaluations</Text>
        {hasEvaluations ? (
          (today.evaluations ?? []).map((evaluation, index) => (
            <View
              key={evaluation.id}
              className={`py-2 ${index > 0 ? "border-t border-gray-100" : ""}`}
            >
              <Text className="text-sm text-black" numberOfLines={1}>
                {evaluation.title ?? "Évaluation"}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                {evaluation.courseName ?? "Cours"}
                {evaluation.startsAt ? ` · ${evaluation.startsAt}` : ""}
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-sm text-gray-400 py-1">
            Aucune évaluation prévue aujourd'hui.
          </Text>
        )}
      </View>
    </View>
  );
}
