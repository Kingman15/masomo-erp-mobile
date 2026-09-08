export const schoolYearKeys = {
  all: ["schoolYears"] as const,
  list: (filters: { studentId?: string | null }) =>
    [...schoolYearKeys.all, "list", filters] as const,
  current: () => [...schoolYearKeys.all, "current"] as const,
  detail: (id?: string) => [...schoolYearKeys.all, "detail", id] as const,
};
