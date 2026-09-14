export const studentAttendanceJustificationStatusKeys = {
  all: ["studentAttendanceJustificationStatuses"] as const,

  list: () =>
    [...studentAttendanceJustificationStatusKeys.all, "list"] as const,
};
