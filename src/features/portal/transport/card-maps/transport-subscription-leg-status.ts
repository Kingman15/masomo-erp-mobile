import type { TransportSubscriptionLegDirection, TransportSubscriptionLegStatus } from "@/utils/types/TransportSubscriptionLeg";

export const TRANSPORT_SUBSCRIPTION_LEG_STATUS_LABEL_MAP: Record<TransportSubscriptionLegStatus, string> = {
  pending: "En attente",
  active: "Actif",
  suspended: "Suspendu",
  cancelled: "Annulé",
  expired: "Expiré",
};

export const TRANSPORT_SUBSCRIPTION_LEG_DIRECTION_LABEL_MAP: Record<TransportSubscriptionLegDirection, string> = {
  inbound: "Aller",
  outbound: "Retour",
};
