import { userCan } from "@/hooks/use-can";
import { useAuthStore, type User } from "@/stores/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Href } from "expo-router";
import { useMemo } from "react";

// Routes sous forme de chemin (pas d'objet { pathname }) : aussi utilisées comme clés React et comparées à usePathname().
export type RoutePath = Extract<Href, string>;

// permission : code(s) `.view` exigé(s) par l'API de l'écran, tous requis ; absent = toujours visible (accueil, calendrier, synchro, profil).
// homeroomOnly : écran du titulaire, masqué à l'enseignant sans classe (comme homeroomOnly côté web).
type StaffMenuAccess = {
  permission?: string | string[];
  homeroomOnly?: boolean;
};

export type StaffMenuLink = StaffMenuAccess & {
  type: "link";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: RoutePath;
};

export type StaffMenuGroup = {
  type: "group";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: (StaffMenuAccess & { label: string; href: RoutePath })[];
};

export type StaffMenuItem = StaffMenuLink | StaffMenuGroup;

export const STAFF_MENU: StaffMenuItem[] = [
  {
    type: "link",
    label: "Accueil",
    icon: "grid-outline",
    href: "/staff",
  },
  {
    type: "group",
    label: "Cours",
    icon: "book-outline",
    children: [
      {
        label: "Leçons",
        href: "/staff/lessons",
        permission: "academics.lessons.view",
      },
      {
        label: "Cours",
        href: "/staff/teaching-courses",
        permission: "academics.teachingCourses.view",
      },
    ],
  },
  {
    type: "link",
    label: "Évaluation",
    icon: "checkmark-done-outline",
    href: "/staff/evaluations",
    permission: "academics.evaluations::courseEvaluations.view",
  },
  {
    // L'API des deux rapports exige aussi courseEvaluations.view (routes /course-averages, /student-rankings).
    type: "group",
    label: "Résultats",
    icon: "podium-outline",
    children: [
      {
        label: "Moyennes par cours",
        href: "/staff/course-averages",
        permission: [
          "academics.evaluations::reports::courseAverage.view",
          "academics.evaluations::courseEvaluations.view",
        ],
      },
      {
        label: "Palmarès",
        href: "/staff/honor-roll",
        permission: [
          "academics.evaluations::reports::studentRanking.view",
          "academics.evaluations::courseEvaluations.view",
        ],
        homeroomOnly: true,
      },
      {
        label: "Appréciations",
        href: "/staff/appraisals",
        permission: "academics.studentAppraisals.view",
        homeroomOnly: true,
      },

      {
        // En ligne uniquement ; l'API limite le titulaire à sa classe (EnrollmentDecisionPolicy).
        label: "Délibération",
        href: "/staff/deliberation",
        permission: "academics.enrollmentDecisions.view",
        homeroomOnly: true,
      },

      {
        // Consultation en ligne uniquement ; l'API limite le titulaire à sa classe (gate manageReportCards).
        label: "Bulletins",
        href: "/staff/report-cards",
        permission: "academics.evaluations::reports::studentReportCard.view",
        homeroomOnly: true,
      },
    ],
  },
  {
    // Consultation : élèves inscrits, fiche et tuteurs (l'API limite un enseignant à ses classes).
    type: "link",
    label: "Élèves",
    icon: "people-outline",
    href: "/staff/students",
    permission: "enrollment.list.view",
  },
  {
    // Consultation : situation des frais d'une classe ; la fiche élève donne le détail (échéancier, paiements, reçus).
    type: "link",
    label: "Contrôle des frais",
    icon: "wallet-outline",
    href: "/staff/fees",
    permission: "schoolFees.reports::collectionList.view",
  },
  {
    type: "link",
    label: "Présences",
    icon: "checkbox-outline",
    href: "/staff/attendance",
    permission: "attendance.records.view",
  },
  {
    type: "group",
    label: "Discipline",
    icon: "shield-outline",
    children: [
      {
        label: "Incident",
        href: "/staff/incidents",
        permission: "discipline.incidents.view",
      },
      {
        label: "Sanction",
        href: "/staff/sanctions",
        permission: "discipline.sanctions.view",
      },
      {
        label: "Règlement d'ordre intérieur",
        href: "/staff/internal-regulations",
        permission: "discipline.internalRegulations.view",
      },
    ],
  },
  {
    type: "group",
    label: "Planning",
    icon: "calendar-outline",
    children: [
      {
        label: "Horaire de cours",
        href: "/staff/schedule",
        permission: "academics.schedules::teaching.view",
      },
      { label: "Calendrier scolaire", href: "/staff/calendar" },
    ],
  },
  {
    // Sans permission : /notifications ne renvoie que celles du compte.
    type: "link",
    label: "Notifications",
    icon: "notifications-outline",
    href: "/staff/notifications",
  },
  {
    // Sans permission : /staff/announcements ne renvoie que les communiqués adressés au compte.
    type: "link",
    label: "Communiqués",
    icon: "megaphone-outline",
    href: "/staff/announcements",
  },
  {
    type: "link",
    label: "Documents",
    icon: "folder-outline",
    href: "/staff/documents",
    permission: "communication.documents.view",
  },
  {
    type: "link",
    label: "Messagerie",
    icon: "chatbubble-ellipses-outline",
    href: "/staff/messaging",
    permission: "communication.conversations.view",
  },
  {
    type: "link",
    label: "Synchronisation",
    icon: "cloud-upload-outline",
    href: "/staff/sync",
  },
  {
    type: "link",
    label: "Profil",
    icon: "person-outline",
    href: "/staff/profil",
  },
];

function isAllowed(user: User | null, access: StaffMenuAccess | undefined) {
  // Comme useVisibleMenu côté web : seul un enseignant non titulaire perd ces écrans ; la direction les garde via ses permissions.
  if (
    access?.homeroomOnly &&
    user?.role.roleCategory === "teacher" &&
    !user.isHomeroomTeacher
  )
    return false;

  const permissions = access?.permission ?? [];
  return (Array.isArray(permissions) ? permissions : [permissions]).every(
    (permission) => userCan(user, permission),
  );
}

// Comme useVisibleMenu côté web : une entrée sans permission disparaît, un groupe sans enfant visible aussi.
export function filterStaffMenu(
  items: StaffMenuItem[],
  user: User | null,
): StaffMenuItem[] {
  return items.flatMap((item): StaffMenuItem[] => {
    if (item.type === "link") {
      return isAllowed(user, item) ? [item] : [];
    }

    const children = item.children.filter((child) => isAllowed(user, child));
    return children.length > 0 ? [{ ...item, children }] : [];
  });
}

export function useVisibleStaffMenu(): StaffMenuItem[] {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => filterStaffMenu(STAFF_MENU, user), [user]);
}

// Pour une liste à plat (accès rapides de l'accueil) : même règle, à partir de la route.
export function useCanOpenStaffRoute(): (href: RoutePath) => boolean {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => {
    const accessByHref = new Map<RoutePath, StaffMenuAccess>();
    for (const item of STAFF_MENU) {
      if (item.type === "link") accessByHref.set(item.href, item);
      else
        item.children.forEach((child) => accessByHref.set(child.href, child));
    }
    return (href) => isAllowed(user, accessByHref.get(href));
  }, [user]);
}
