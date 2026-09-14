import type { BusSchedulePeriodType } from "@/utils/types/objects/PortalTransportScheduleDTO";

export const BUS_SCHEDULE_PERIOD_TYPE_LABEL_MAP: Record<BusSchedulePeriodType, string> = {
  regular: "Régulier",
  vacation: "Vacances",
  special: "Spécial",
};
