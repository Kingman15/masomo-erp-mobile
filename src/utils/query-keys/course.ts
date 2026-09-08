export const courseKeys = {
  all: ["courses"] as const,
  list: (filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    teacherId?: string | null;
  }) => [...courseKeys.all, "list", filters] as const,
  followed: (filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    teacherId?: string | null;
  }) => [...courseKeys.all, "followed", filters] as const,
};
