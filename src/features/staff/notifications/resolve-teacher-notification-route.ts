import type { NotificationDTO } from "@/utils/types/objects/NotificationDTO";

// Pendant de resolveNotificationRoute (portail) pour l'espace enseignant.
const NOTIFICATION_TYPE_ROUTE: Record<string, string | undefined> = {
  "discipline.incident.created": "/staff/incidents",
  "discipline.sanction.decided": "/staff/sanctions",
  "attendance.absence.recorded": "/staff/attendance",
  "academics.result.published": "/staff/evaluations",
  "communication.message.received": "/staff/messaging",
  "communication.document.shared": "/staff/documents",
};

export function resolveTeacherNotificationRoute(
  notification: Pick<NotificationDTO, "type" | "subjectType" | "subjectId">,
): string | null {
  if (notification.subjectType === "announcement" && notification.subjectId) {
    return `/staff/announcements/${notification.subjectId}`;
  }

  return NOTIFICATION_TYPE_ROUTE[notification.type] ?? null;
}
