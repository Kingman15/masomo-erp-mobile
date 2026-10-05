export const studentPeriodAppraisalKeys = {
  all: ["studentPeriodAppraisals"] as const,

  grid: (filters: {
    schoolClassId?: string | null;
    schoolYearId?: string | null;
    schoolPeriodId?: string | null;
  }) =>
    [
      ...studentPeriodAppraisalKeys.all,
      "grid",
      {
        schoolClassId: filters.schoolClassId ?? null,
        schoolYearId: filters.schoolYearId ?? null,
        schoolPeriodId: filters.schoolPeriodId ?? null,
      },
    ] as const,

  mentions: () => [...studentPeriodAppraisalKeys.all, "mentions"] as const,

  generalClassSchoolPeriods: (
    schoolYearId: string | null | undefined,
    generalClassId: string | null | undefined,
  ) =>
    [
      "generalClassSchoolPeriods",
      { schoolYearId: schoolYearId ?? null, generalClassId: generalClassId ?? null },
    ] as const,
};
