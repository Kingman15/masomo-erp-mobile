export const teachingCourseKeys = {
  all: ["teaching-courses"] as const,

  list: (filters: {
    schoolYearId?: string | null;
    courseId?: string | null;
    schoolClassId?: string | null;
  }) => [...teachingCourseKeys.all, "list", filters] as const,

  detail: (id?: string) => [...teachingCourseKeys.all, "detail", id] as const,
};
