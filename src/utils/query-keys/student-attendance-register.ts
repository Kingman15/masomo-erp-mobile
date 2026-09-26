export const studentAttendanceRegisterKeys = {
  all: ["studentAttendanceRegisters"] as const,

  list: (filters: { schoolYearId?: string | null; status?: string | null }) =>
    [...studentAttendanceRegisterKeys.all, "list", filters] as const,
};
