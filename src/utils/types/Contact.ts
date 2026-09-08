// -----------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------

export const CONTACT_ENTITY_TYPES = [
  "school",
  "scholar_group",
  "school_boarding",
  "employee",
  "user",
  "school_building",
  "guardian",
  "student",
] as const;
export const CONTACT_TYPES = [
  "phone",
  "email",
  "whatsapp",
  "fax",
  "website",
  "social_media",
  "other",
] as const;
export const CONTACT_CATEGORIES = [
  "personal",
  "work",
  "home",
  "emergency",
  "other",
] as const;

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type ContactEntityType = (typeof CONTACT_ENTITY_TYPES)[number];
export type ContactType = (typeof CONTACT_TYPES)[number];
export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

// -----------------------------------------------------------------------
// Icones
// -----------------------------------------------------------------------

// Adjust
// export const CONTACT_ICONS: Record<ContactType, LucideIcon> = {
//   phone: Phone,
//   email: Mail,
//   whatsapp: MessageCircle,
//   fax: Phone,
//   website: Globe,
//   social_media: Share2,
//   other: CircleEllipsis,
// };

// -----------------------------------------------------------------------
// Labels
// -----------------------------------------------------------------------

export const CONTACT_LABELS: Record<ContactType, string> = {
  phone: "Téléphone",
  email: "E-mail",
  whatsapp: "WhatsApp",
  fax: "Fax",
  website: "Site web",
  social_media: "Réseau social",
  other: "Autre",
};

// -----------------------------------------------------------------------
// Resource
// -----------------------------------------------------------------------

export interface Contact {
  id: string;
  code: string | null;

  entityType: ContactEntityType | null;
  entityId: string | null;

  contactType: ContactType | null;
  category: ContactCategory | null;

  value: string | null;
  label: string | null;

  isActive: boolean | null;
  isPrimary: boolean | null;
  isVerified: boolean | null;
  isPublic: boolean | null;

  notes: string | null;
}
