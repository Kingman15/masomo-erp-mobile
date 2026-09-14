export const guardianKeys = {
  all: ["guardians"] as const,
  list: (filters: { schoolYearId?: string | null; searchTerm?: string | null }) =>
    [...guardianKeys.all, "list", filters] as const,
};
