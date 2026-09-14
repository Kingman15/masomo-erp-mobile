import type { AnnouncementCategory } from "@/utils/types/objects/PortalAnnouncementDTO";

export const ANNOUNCEMENT_CATEGORY_LABEL_MAP: Record<
  AnnouncementCategory,
  string
> = {
  general: "Général",
  fees: "Frais scolaires",
  event: "Événement",
  academic: "Académique",
  urgent: "Urgent",
};
