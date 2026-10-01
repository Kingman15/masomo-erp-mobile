export const schoolCalendarKeys = {
  all: ["school-calendar"] as const,
  detail: (schoolYearId?: string | null) =>
    [...schoolCalendarKeys.all, schoolYearId] as const,
};
