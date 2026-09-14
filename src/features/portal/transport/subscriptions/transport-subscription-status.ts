import type { TransportSubscriptionStatus } from "@/utils/types/TransportSubscription";
import type { TransportSubscriptionLegDirection } from "@/utils/types/TransportSubscriptionLeg";

export const TRANSPORT_SUBSCRIPTION_STATUS_LABEL_MAP: Record<
  TransportSubscriptionStatus,
  string
> = {
  pending: "En attente",
  active: "Actif",
  suspended: "Suspendu",
  cancelled: "Annulé",
  expired: "Expiré",
};

export const TRANSPORT_SUBSCRIPTION_LEG_DIRECTION_LABEL_MAP: Record<
  TransportSubscriptionLegDirection,
  string
> = {
  inbound: "Aller",
  outbound: "Retour",
};
