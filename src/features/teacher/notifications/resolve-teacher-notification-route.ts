import type { NotificationDTO } from "@/utils/types/objects/NotificationDTO";

// Pendant de resolveNotificationRoute (portail) pour l'espace enseignant.
const NOTIFICATION_TYPE_ROUTE: Record<string, string | undefined> = {
  "discipline.incident.created": "/teacher/incidents",
  "discipline.sanction.decided": "/teacher/sanctions",
  "attendance.absence.recorded": "/teacher/attendance",
  "academics.result.published": "/teacher/evaluations",
  "communication.message.received": "/teacher/messaging",
  "communication.document.shared": "/teacher/documents",
};

export function resolveTeacherNotificationRoute(
  notification: Pick<NotificationDTO, "type" | "subjectType" | "subjectId">,
): string | null {
  if (notification.subjectType === "announcement" && notification.subjectId) {
    return `/teacher/announcements/${notification.subjectId}`;
  }

  return NOTIFICATION_TYPE_ROUTE[notification.type] ?? null;
}
