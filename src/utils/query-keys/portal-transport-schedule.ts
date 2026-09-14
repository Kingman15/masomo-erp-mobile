export const portalTransportScheduleKeys = {
  all: ["portal-transport-schedules"] as const,

  list: (studentId: string | null | undefined) =>
    [...portalTransportScheduleKeys.all, studentId, "list"] as const,
};
