export type NotificationSeverity = "info" | "warning" | "urgent";

export interface NotificationDTO {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  occurredAt: string;
  isRead: boolean;
  readAt: string | null;
  subjectType: string | null;
  subjectId: string | null;
  studentId: string | null;
  student: { id: string; fullName: string } | null;
}
