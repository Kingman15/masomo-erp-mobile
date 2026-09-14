export const portalDashboardKeys = {
  all: ["portalDashboard"] as const,

  household: () => [...portalDashboardKeys.all, "household"] as const,

  studentSummary: (studentId?: string | null, schoolYearId?: string | null) =>
    [...portalDashboardKeys.all, "studentSummary", studentId, schoolYearId] as const,

  studentToday: (
    studentId?: string | null,
    schoolYearId?: string | null,
    schoolClassId?: string | null,
  ) =>
    [
      ...portalDashboardKeys.all,
      "studentToday",
      studentId,
      schoolYearId,
      schoolClassId,
    ] as const,
};
