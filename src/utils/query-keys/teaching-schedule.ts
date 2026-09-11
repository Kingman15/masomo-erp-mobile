export const teachingScheduleKeys = {
  all: ["teaching-schedules"] as const,

  byLessonDate: (filters: {
    schoolYearId?: string | null;
    courseId?: string | null;
    schoolClassId?: string | null;
    lessonDate?: string | null;
  }) => [...teachingScheduleKeys.all, "by-lesson-date", filters] as const,

  schedules: (filters: {
    courseScheduleId?: string | null;
    schoolClassId?: string | null;
    courseId?: string | null;
  }) => [...teachingScheduleKeys.all, "schedules", filters] as const,
};
