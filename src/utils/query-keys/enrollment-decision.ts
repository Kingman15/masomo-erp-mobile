export const enrollmentDecisionKeys = {
  all: ["enrollmentDecisions"] as const,

  grid: (filters: {
    schoolClassId?: string | null;
    schoolYearId?: string | null;
    session: number;
  }) =>
    [
      ...enrollmentDecisionKeys.all,
      "grid",
      {
        schoolClassId: filters.schoolClassId ?? null,
        schoolYearId: filters.schoolYearId ?? null,
        session: filters.session,
      },
    ] as const,

  types: () => [...enrollmentDecisionKeys.all, "types"] as const,

  passMark: () => [...enrollmentDecisionKeys.all, "passMark"] as const,

  points: (filters: {
    schoolClassId?: string | null;
    schoolYearId?: string | null;
    session: number;
    enrollmentId?: string | null;
  }) =>
    [
      ...enrollmentDecisionKeys.all,
      "points",
      {
        schoolClassId: filters.schoolClassId ?? null,
        schoolYearId: filters.schoolYearId ?? null,
        session: filters.session,
        enrollmentId: filters.enrollmentId ?? null,
      },
    ] as const,
};
