import type { FeeScheduleSortBy, FeeScheduleStatus } from "@/utils/types/objects/FeeScheduleDTO";

export type FeesFiltersForm = {
  status: FeeScheduleStatus[];
  sortBy: FeeScheduleSortBy | null;
};

export const emptyFeesFilters: FeesFiltersForm = {
  status: [],
  sortBy: null,
};
