import { Employee } from "./Employee";
import { SchoolShift } from "./SchoolShift";
import { TransportPricingPlan } from "./TransportPricingPlan";
import { TransportSubscriptionLeg } from "./TransportSubscriptionLeg";

export type TransportSubscriptionStatus =
  | "pending"
  | "active"
  | "suspended"
  | "cancelled"
  | "expired";

export interface TransportSubscription {
  id: string;
  status: TransportSubscriptionStatus | null;
  overrideAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  requestedAt: string | null;
  approvedAt: string | null;
  note: string | null;

  shift: SchoolShift | null;
  pricingPlan: TransportPricingPlan | null;
  approvedByEmployee: Employee | null;
  legs: TransportSubscriptionLeg[] | null;
}
