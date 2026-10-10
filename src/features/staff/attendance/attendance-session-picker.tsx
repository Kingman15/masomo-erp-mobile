import { ComboBox } from "@/components/list/combo-box";
import { useCan } from "@/hooks/use-can";
import { router } from "expo-router";
import type { StudentAttendanceRegister } from "@/utils/types/StudentAttendanceRegister";
import type { StudentAttendanceSession } from "@/utils/types/StudentAttendanceSession";
import { Pressable, Text } from "react-native";
import { getSessionLabel } from "./attendance-labels";

type AttendanceSessionPickerProps = {
  registers: StudentAttendanceRegister[] | undefined;
  registersIsLoading: boolean;
  registerId: string | null;
  onRegisterChange: (id: string | null) => void;
  sessions: StudentAttendanceSession[] | undefined;
  sessionsIsLoading: boolean;
  sessionId: string | null | undefined;
  onSessionChange: (id: string | null) => void;
  sessionError?: string;
  disabled?: boolean;
};

export function AttendanceSessionPicker({
  registers,
  registersIsLoading,
  registerId,
  onRegisterChange,
  sessions,
  sessionsIsLoading,
  sessionId,
  onSessionChange,
  sessionError,
  disabled,
}: AttendanceSessionPickerProps) {
  // Sessions créées par la direction ; un enseignant n'a en général pas ce droit et ne voit pas le lien.
  const canCreateSession = useCan("attendance.sessions.create");

  return (
    <>
      <ComboBox
        label="Registre de présences"
        placeholder="Sélectionner un registre"
        options={(registers ?? []).map((register) => ({
          id: register.id,
          label: register.title ?? register.code ?? "Registre",
        }))}
        value={registerId}
        onChange={(id) => {
          onRegisterChange(id);
          onSessionChange(null);
        }}
        loading={registersIsLoading}
        disabled={disabled}
        emptyLabel="Aucun registre disponible"
      />

      <ComboBox
        label="Session de présences"
        placeholder="Sélectionner une session"
        options={(sessions ?? []).map((session) => ({
          id: session.id,
          label: getSessionLabel(session),
        }))}
        value={sessionId ?? null}
        onChange={onSessionChange}
        loading={sessionsIsLoading && Boolean(registerId)}
        disabled={disabled}
        emptyLabel={
          registerId ? "Aucune session disponible" : "Sélectionnez un registre"
        }
      />
      {sessionError && (
        <Text className="text-xs text-red-500 -mt-3 mb-3">{sessionError}</Text>
      )}
      {canCreateSession && !disabled && (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/staff/attendance/new-session",
              params: registerId ? { registerId } : {},
            })
          }
          className="self-start -mt-2 mb-4"
        >
          <Text className="text-sm font-medium text-primary dark:text-violet-400">
            + Nouvelle session
          </Text>
        </Pressable>
      )}
    </>
  );
}
