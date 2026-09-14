import { BusLine } from "./BusLine";
import { BusStop } from "./BusStop";

export type TransportSubscriptionLegDirection = "inbound" | "outbound";
export type TransportSubscriptionLegStatus =
  | "pending"
  | "active"
  | "suspended"
  | "cancelled"
  | "expired";

export interface TransportSubscriptionLeg {
  id: string;
  direction: TransportSubscriptionLegDirection | null;
  status: TransportSubscriptionLegStatus | null;
  startDate: string | null;
  endDate: string | null;

  busLine: BusLine | null;
  busStop: BusStop | null;
}
