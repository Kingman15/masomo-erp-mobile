import { useStudentAttendanceRegisters } from "@/hooks/queries/items/student-attendance-register";
import { useStudentAttendanceSessions } from "@/hooks/queries/items/student-attendance-session";
import { useState } from "react";

type UseAttendanceRegistersSessionsParams = {
  schoolYearId: string | null | undefined;
  initialRegisterId?: string | null;
};

// Cascade année scolaire → registre → sessions, comme la page de pointage du web.
export function useAttendanceRegistersSessions({
  schoolYearId,
  initialRegisterId = null,
}: UseAttendanceRegistersSessionsParams) {
  const [selectedRegisterId, setRegisterId] = useState<string | null>(
    initialRegisterId,
  );

  const {
    studentAttendanceRegisters,
    studentAttendanceRegistersIsLoading,
  } = useStudentAttendanceRegisters({
    filters: { schoolYearId },
    enabled: Boolean(schoolYearId),
  });

  // Un seul registre disponible : il est sélectionné d'office.
  const registerId =
    selectedRegisterId ??
    (studentAttendanceRegisters?.length === 1
      ? studentAttendanceRegisters[0].id
      : null);

  const { studentAttendanceSessions, studentAttendanceSessionsIsLoading } =
    useStudentAttendanceSessions({
      filters: { registerId },
      enabled: Boolean(registerId),
    });

  return {
    registerId,
    setRegisterId,
    registers: studentAttendanceRegisters,
    registersIsLoading: studentAttendanceRegistersIsLoading,
    sessions: registerId ? studentAttendanceSessions : [],
    sessionsIsLoading: studentAttendanceSessionsIsLoading,
  };
}
