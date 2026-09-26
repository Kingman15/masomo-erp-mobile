export const studentAttendanceSessionKeys = {
  all: ["studentAttendanceSessions"] as const,

  list: (filters: {
    registerId?: string | null;
    status?: string | null;
    shiftId?: string | null;
  }) => [...studentAttendanceSessionKeys.all, "list", filters] as const,
};
