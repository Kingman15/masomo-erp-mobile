type StudentAttendanceRecordFilters = {
  sessionId?: string | null;
  pointingTypeId?: string | null;
  pointingChannelId?: string | null;
  justificationStatusId?: string | null;
  sectionId?: string | null;
  schoolClassId?: string | null;
  schoolYearId?: string | null;
  studentId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export const studentAttendanceRecordKeys = {
  all: ["studentAttendanceRecords"] as const,

  list: (filters: StudentAttendanceRecordFilters) =>
    [...studentAttendanceRecordKeys.all, "list", filters] as const,

  detail: (id?: string) =>
    [...studentAttendanceRecordKeys.all, "detail", id] as const,

  summary: (filters: StudentAttendanceRecordFilters) =>
    [...studentAttendanceRecordKeys.all, "summary", filters] as const,
};
