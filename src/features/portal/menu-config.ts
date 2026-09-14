import Ionicons from "@expo/vector-icons/Ionicons";

export type MenuSubItem = {
  slug: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type MenuCategory = {
  slug: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  subItems?: MenuSubItem[];
};

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    slug: "grades",
    label: "Notes scolaires",
    description: "Évaluations, résultats, moyennes, palmarès",
    icon: "document-text-outline",
    color: "#2563eb",
    subItems: [
      { slug: "evaluations", label: "Évaluations", icon: "create-outline" },
      { slug: "results", label: "Résultats", icon: "bar-chart-outline" },
      { slug: "averages", label: "Moyennes", icon: "calculator-outline" },
      { slug: "honor-roll", label: "Palmarès", icon: "trophy-outline" },
    ],
  },
  {
    slug: "discipline",
    label: "Discipline",
    description: "Présences, incidents, sanctions, règlement",
    icon: "clipboard-outline",
    color: "#dc2626",
    subItems: [
      { slug: "attendance", label: "Présences", icon: "checkbox-outline" },
      { slug: "incidents", label: "Incidents", icon: "alert-circle-outline" },
      { slug: "sanctions", label: "Sanctions", icon: "hand-left-outline" },
      {
        slug: "rules",
        label: "Règlement d'ordre intérieur",
        icon: "book-outline",
      },
    ],
  },
  {
    slug: "finance",
    label: "Finances",
    description: "Frais, paiements, dérogations",
    icon: "cash-outline",
    color: "#16a34a",
    subItems: [
      { slug: "fees", label: "Frais", icon: "pricetag-outline" },
      { slug: "payments", label: "Paiements", icon: "card-outline" },
      { slug: "waivers", label: "Dérogations", icon: "document-outline" },
    ],
  },
  {
    slug: "transport",
    label: "Transport",
    description: "Abonnements, factures & paiements, horaires, carte",
    icon: "bus-outline",
    color: "#d97706",
    subItems: [
      { slug: "subscriptions", label: "Abonnements", icon: "bookmark-outline" },
      {
        slug: "subscription-fees",
        label: "Frais d'abonnement",
        icon: "pricetag-outline",
      },
      {
        slug: "invoices-payments",
        label: "Factures & paiements",
        icon: "receipt-outline",
      },
      { slug: "schedule", label: "Horaires", icon: "time-outline" },
      { slug: "card-maps", label: "Carte Maps", icon: "id-card-outline" },
    ],
  },
  {
    slug: "communication",
    label: "Communication",
    description: "Messagerie, documents partagés, communiqués",
    icon: "chatbubbles-outline",
    color: "#7c3aed",
    subItems: [
      {
        slug: "documents",
        label: "Documents partagés",
        icon: "folder-outline",
      },
      {
        slug: "announcements",
        label: "Communiqués",
        icon: "megaphone-outline",
      },
      {
        slug: "messaging",
        label: "Messagerie",
        icon: "chatbubble-ellipses-outline",
      },
    ],
  },
  {
    slug: "schedule",
    label: "Emploi du temps",
    description: "Horaire des cours",
    icon: "calendar-outline",
    color: "#0891b2",
  },
];

export function getMenuCategory(slug: string) {
  return MENU_CATEGORIES.find((category) => category.slug === slug);
}

export function getMenuSubItem(categorySlug: string, itemSlug: string) {
  return getMenuCategory(categorySlug)?.subItems?.find(
    (item) => item.slug === itemSlug,
  );
}
