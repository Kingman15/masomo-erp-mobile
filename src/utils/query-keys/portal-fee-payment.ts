export const portalFeePaymentKeys = {
  all: ["portal-fee-payments"] as const,

  list: (
    studentId: string | null | undefined,
    filters: {
      schoolYearId?: string | null;
      schoolClassId?: string | null;
    },
  ) => [...portalFeePaymentKeys.all, studentId, "list", filters] as const,

  detail: (studentId: string | null | undefined, feePaymentId?: string) =>
    [...portalFeePaymentKeys.all, studentId, "detail", feePaymentId] as const,
};
