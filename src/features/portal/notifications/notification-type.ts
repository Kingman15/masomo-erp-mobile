import type {
  NotificationDTO,
  NotificationSeverity,
} from "@/utils/types/objects/NotificationDTO";

export const NOTIFICATION_TYPE_LABEL_MAP: Record<string, string> = {
  "schoolFees.installment.paid": "Paiement reçu",
  "schoolFees.derogation.granted": "Dérogation de paiement accordée",
  "enrollment.student.enrolled": "Inscription confirmée",
  "discipline.incident.created": "Incident disciplinaire",
  "discipline.sanction.decided": "Sanction décidée",
  "attendance.absence.recorded": "Absence enregistrée",
  "academics.result.published": "Résultat publié",
  "communication.message.received": "Nouveau message",
  "communication.announcement.published": "Communiqué publié",
  "communication.document.shared": "Document partagé",
};

export const NOTIFICATION_TYPE_OPTIONS = Object.entries(
  NOTIFICATION_TYPE_LABEL_MAP,
).map(([id, label]) => ({ id, label }));

const NOTIFICATION_TYPE_SEVERITY: Record<string, NotificationSeverity> = {
  "schoolFees.installment.paid": "info",
  "schoolFees.derogation.granted": "info",
  "enrollment.student.enrolled": "info",
  "discipline.incident.created": "warning",
  "discipline.sanction.decided": "urgent",
  "attendance.absence.recorded": "warning",
  "academics.result.published": "info",
  "communication.message.received": "info",
  "communication.announcement.published": "info",
  "communication.document.shared": "info",
};

export function resolveNotificationSeverity(type: string): NotificationSeverity {
  return NOTIFICATION_TYPE_SEVERITY[type] ?? "info";
}

export const NOTIFICATION_SEVERITY_BADGE: Record<
  NotificationSeverity,
  { bg: string; fg: string }
> = {
  info: { bg: "bg-blue-100", fg: "text-blue-700" },
  warning: { bg: "bg-amber-100", fg: "text-amber-700" },
  urgent: { bg: "bg-red-100", fg: "text-red-700" },
};

const NOTIFICATION_TYPE_ROUTE: Record<string, string | undefined> = {
  "schoolFees.installment.paid": "/portal/menu/finance/payments",
  "schoolFees.derogation.granted": "/portal/menu/finance/waivers",
  "discipline.incident.created": "/portal/menu/discipline/incidents",
  "discipline.sanction.decided": "/portal/menu/discipline/sanctions",
  "attendance.absence.recorded": "/portal/menu/discipline/attendance",
  "academics.result.published": "/portal/menu/grades/results",
  "communication.message.received": "/portal/menu/communication/messaging",
  "communication.document.shared": "/portal/menu/communication/documents",
};

export function resolveNotificationRoute(
  notification: Pick<NotificationDTO, "type" | "subjectType" | "subjectId">,
): string | null {
  if (notification.subjectType === "announcement" && notification.subjectId) {
    return `/portal/menu/communication/announcements/${notification.subjectId}`;
  }

  return NOTIFICATION_TYPE_ROUTE[notification.type] ?? null;
}
