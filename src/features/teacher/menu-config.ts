import Ionicons from "@expo/vector-icons/Ionicons";

export type TeacherMenuLink = {
  type: "link";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
};

export type TeacherMenuGroup = {
  type: "group";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: { label: string; href: string }[];
};

export type TeacherMenuItem = TeacherMenuLink | TeacherMenuGroup;

export const TEACHER_MENU: TeacherMenuItem[] = [
  {
    type: "link",
    label: "Accueil",
    icon: "grid-outline",
    href: "/teacher",
  },
  {
    type: "group",
    label: "Cours",
    icon: "book-outline",
    children: [
      { label: "Leçons", href: "/teacher/lessons" },
      { label: "Cours", href: "/teacher/teaching-courses" },
    ],
  },
  {
    type: "link",
    label: "Évaluation",
    icon: "checkmark-done-outline",
    href: "/teacher/evaluations",
  },
  {
    type: "group",
    label: "Discipline",
    icon: "shield-outline",
    children: [
      { label: "Incident", href: "/teacher/incidents" },
      { label: "Sanction", href: "/teacher/sanctions" },
      {
        label: "Règlement d'ordre intérieur",
        href: "/teacher/internal-regulations",
      },
    ],
  },
  {
    type: "link",
    label: "Horaire",
    icon: "time-outline",
    href: "/teacher/schedule",
  },
  {
    type: "link",
    label: "Documents",
    icon: "folder-outline",
    href: "/teacher/documents",
  },
  {
    type: "link",
    label: "Messagerie",
    icon: "chatbubble-ellipses-outline",
    href: "/teacher/messaging",
  },
];
