export type FeeScheduleStatus = "paid" | "partial" | "overdue" | "upcoming";
export type FeeScheduleSortBy = "status" | "dueDate";

export interface FeeScheduleDTO {
  feeInstallmentId: string | null;
  feeAssignmentId: string | null;
  label: string | null;
  amountDue: string | null;
  amountPaid: string | null;
  amountRemaining: string | null;
  amountDueStr: string | null;
  amountPaidStr: string | null;
  amountRemainingStr: string | null;
  currencyIsoCode: string | null;
  dueDate: string | null;
  status: FeeScheduleStatus | null;
  statusLabel: string | null;
}
