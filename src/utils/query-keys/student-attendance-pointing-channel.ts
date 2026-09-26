export const studentAttendancePointingChannelKeys = {
  all: ["studentAttendancePointingChannels"] as const,

  list: () => [...studentAttendancePointingChannelKeys.all, "list"] as const,
};
