export const ANNOUNCEMENT_CATEGORIES = [
  "general",
  "fees",
  "event",
  "academic",
  "urgent",
] as const;

export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number];

export interface PortalAnnouncementDocumentDTO {
  id: string;
  document: {
    mimeType: string | null;
    title: string | null;
    originalName: string | null;
    url: string | null;
  } | null;
}

export interface PortalAnnouncementDTO {
  id: string;
  title: string;
  body: string | null;
  category: AnnouncementCategory | null;
  isPinned: boolean;
  publishedAt: string;
  expiresAt: string | null;
  isRead: boolean;
  documents: PortalAnnouncementDocumentDTO[];
}
