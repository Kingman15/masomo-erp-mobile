export const schoolClassKeys = {
  all: ["schoolClasses"] as const,
  list: (filters: {
    sectionId?: string | null;
    optionId?: string | null;
    cycleId?: string | null;
    generalClassId?: string | null;
    excludeByStudentAttendanceSessionId?: string | null;
    teacherId?: string | null;
    schoolYearId?: string | null;
    studentId?: string | null;
  }) => [...schoolClassKeys.all, "list", filters] as const,
  detail: (id?: string) => [...schoolClassKeys.all, "detail", id] as const,
};
