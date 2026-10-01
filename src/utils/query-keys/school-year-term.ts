export const schoolYearTermKeys = {
  all: ["schoolYearTerms"] as const,

  list: (filters: { schoolYearId?: string | null }) =>
    [...schoolYearTermKeys.all, "list", filters] as const,
};
