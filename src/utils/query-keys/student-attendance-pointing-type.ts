export const studentAttendancePointingTypeKeys = {
  all: ["studentAttendancePointingTypes"] as const,

  list: () => [...studentAttendancePointingTypeKeys.all, "list"] as const,
};
