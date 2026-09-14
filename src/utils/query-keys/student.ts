export const studentKeys = {
  all: ["students"] as const,

  list: (filters: { schoolYearId?: string | null; searchTerm?: string | null }) =>
    [...studentKeys.all, "list", filters] as const,

  currentStudents: () => [...studentKeys.all, "currentStudents"] as const,
};
