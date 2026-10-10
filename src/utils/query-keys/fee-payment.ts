import type { FeeScheduleSortBy, FeeScheduleStatus } from "@/utils/types/objects/FeeScheduleDTO";

export const feePaymentKeys = {
  all: ["feePayments"] as const,

  feeSchedule: (filters: {
    studentId?: string | null;
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    status?: FeeScheduleStatus[] | null;
    sortBy?: FeeScheduleSortBy | null;
  }) =>
    [
      ...feePaymentKeys.all,
      "list",
      "feeSchedule",
      {
        studentId: filters.studentId ?? null,
        schoolYearId: filters.schoolYearId ?? null,
        schoolClassId: filters.schoolClassId ?? null,
        status: filters.status ?? null,
        sortBy: filters.sortBy ?? null,
      },
    ] as const,

  feeScheduleSummary: (filters: {
    studentId?: string | null;
    schoolYearId?: string | null;
    schoolClassId?: string | null;
  }) =>
    [
      ...feePaymentKeys.all,
      "feeScheduleSummary",
      {
        studentId: filters.studentId ?? null,
        schoolYearId: filters.schoolYearId ?? null,
        schoolClassId: filters.schoolClassId ?? null,
      },
    ] as const,

  // Consultation du personnel
  byEnrollment: (enrollmentId?: string | null) =>
    [...feePaymentKeys.all, "byEnrollment", enrollmentId ?? null] as const,
  detail: (id?: string) => [...feePaymentKeys.all, "detail", id] as const,
  derogations: (enrollmentId?: string | null) =>
    [...feePaymentKeys.all, "derogations", enrollmentId ?? null] as const,
  collectionFees: (schoolYearId?: string | null, schoolClassId?: string | null) =>
    [...feePaymentKeys.all, "collectionFees", schoolYearId ?? null, schoolClassId ?? null] as const,
  collectionList: (filters: {
    schoolYearId?: string | null;
    schoolClassId?: string | null;
    feeIds: string[];
  }) => [...feePaymentKeys.all, "collectionList", filters] as const,
};
