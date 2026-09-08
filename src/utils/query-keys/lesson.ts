export const lessonKeys = {
  all: ["lessons"] as const,

  list: (filters: {
    schoolYearId?: string | null;
    courseId?: string | null;
    schoolClassId?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    searchTerm?: string | null;
    teacherId?: string | null;
  }) => [...lessonKeys.all, "list", filters] as const,

  detail: (id?: string) => [...lessonKeys.all, "detail", id] as const,
};
