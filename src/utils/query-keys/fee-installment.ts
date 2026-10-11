export const feeInstallmentKeys = {
  all: ["feeInstallments"] as const,
  list: (filters: { schoolYearId?: string | null; generalClassId?: string | null }) =>
    [...feeInstallmentKeys.all, "list", filters] as const,
};
