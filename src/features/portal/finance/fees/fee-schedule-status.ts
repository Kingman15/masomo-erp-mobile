import type { FeeScheduleSortBy, FeeScheduleStatus } from "@/utils/types/objects/FeeScheduleDTO";

export const FEE_SCHEDULE_STATUS_OPTIONS: { value: FeeScheduleStatus; label: string }[] = [
  { value: "upcoming", label: "À venir" },
  { value: "partial", label: "Partiel" },
  { value: "overdue", label: "En retard" },
  { value: "paid", label: "Payé" },
];

export const FEE_SCHEDULE_SORT_OPTIONS: { value: FeeScheduleSortBy; label: string }[] = [
  { value: "dueDate", label: "Échéance" },
  { value: "status", label: "Statut" },
];

export const FEE_SCHEDULE_STATUS_LABEL_MAP: Record<FeeScheduleStatus, string> = {
  upcoming: "À venir",
  partial: "Partiel",
  overdue: "En retard",
  paid: "Payé",
};
