export const documentKeys = {
  all: ["documents"] as const,
  list: (filters: {
    schoolYearId?: string | null;
    audienceType?: string | null;
    audienceId?: string | null;
    search?: string | null;
  }) => [...documentKeys.all, "list", filters] as const,
  detail: (id: string | undefined) =>
    [...documentKeys.all, "detail", id] as const,
};
