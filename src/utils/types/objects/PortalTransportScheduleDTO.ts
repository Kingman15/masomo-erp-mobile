import type { BusStop } from "../BusStop";

export type BusScheduleDirection = "inbound" | "outbound";
export type BusSchedulePeriodType = "regular" | "vacation" | "special";

export interface PortalTransportScheduleDTO {
  id: string;
  legId: string | null;

  busStop: BusStop | null;

  direction: BusScheduleDirection | null;
  directionLabel: string | null;

  time: string | null;

  operatingDaysLabel: string | null;

  validFrom: string | null;
  validUntil: string | null;

  periodType: BusSchedulePeriodType | null;
}
