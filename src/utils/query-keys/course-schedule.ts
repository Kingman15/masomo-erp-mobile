export const courseScheduleKeys = {
  all: ["course-schedules"] as const,

  active: (schoolYearId?: string | null) =>
    [...courseScheduleKeys.all, "active", schoolYearId ?? null] as const,
};
