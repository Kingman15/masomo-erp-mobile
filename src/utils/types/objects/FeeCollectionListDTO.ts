// Contrôle des frais (GET /fees/collection-list), aligné sur le type du web, réduit à ce qu'affiche le mobile.
export type FeeCollectionStatus = "unpaid" | "partial" | "derogation" | "upToDate";

export interface FeeCollectionAvailableFeeDTO {
  feeId: string;
  feeAssignmentId: string;
  label: string;
  feeTypeTitle: string | null;
  currency: string;
  amount: string;
}

export interface FeeCollectionAmountDTO {
  currency: string;
  totalDueStr: string;
  exigibleDueStr: string;
  exigiblePaidStr: string;
  balance: string;
  balanceStr: string;
  collectionRate: number | null;
}

export interface FeeCollectionStudentDTO {
  enrollmentId: string;
  studentId: string;
  studentCode: string | null;
  studentName: string;
  status: FeeCollectionStatus;
  statusLabel: string;
  oldestUnpaidDueDate: string | null;
  amounts: FeeCollectionAmountDTO[];
}

export interface FeeCollectionListDTO {
  schoolClassId: string | null;
  schoolClassTitle: string | null;
  asOfDate: string;
  summary: {
    studentsCount: number;
    countsByStatus: Record<FeeCollectionStatus, number>;
    totals: FeeCollectionAmountDTO[];
  };
  students: FeeCollectionStudentDTO[];
}
