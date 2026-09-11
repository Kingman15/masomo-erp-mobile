export const studentInternalRegulationKeys = {
  all: ["studentInternalRegulations"] as const,
  list: (filters: {
    schoolYearId?: string | null;
    targetType?: string | null;
    targetId?: string | null;
  }) => [...studentInternalRegulationKeys.all, "list", filters] as const,
};
