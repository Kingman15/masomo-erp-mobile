export const guardianKeys = {
  all: ["guardians"] as const,
  list: (filters: { schoolYearId?: string | null; searchTerm?: string | null }) =>
    [...guardianKeys.all, "list", filters] as const,
  contacts: (guardianId?: string | null) =>
    [...guardianKeys.all, "contacts", guardianId ?? null] as const,
  assignments: (studentId?: string | null) =>
    [...guardianKeys.all, "assignments", studentId ?? null] as const,
};
