import type { FeeScheduleStatus } from "./FeeScheduleDTO";

export interface FeeScheduleSummaryDTO {
  installmentsCount: number;
  totalAmountDue: string;
  totalAmountPaid: string;
  totalAmountRemaining: string;
  totalAmountDueStr: string;
  totalAmountPaidStr: string;
  totalAmountRemainingStr: string;
  currencyIsoCode: string | null;
  status: FeeScheduleStatus;
  statusLabel: string;
}
