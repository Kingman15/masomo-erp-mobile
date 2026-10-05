import { userCan } from "@/hooks/use-can";
import { useAuthStore, type User } from "@/stores/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Href } from "expo-router";
import { useMemo } from "react";

// Routes sous forme de chemin (pas d'objet { pathname }) : aussi utilisées comme clés React et comparées à usePathname().
export type RoutePath = Extract<Href, string>;

// permission : code(s) `.view` exigé(s) par l'API de l'écran, tous requis ; absent = toujours visible (accueil, calendrier, synchro, profil).
// homeroomOnly : écran du titulaire, masqué à l'enseignant sans classe (comme homeroomOnly côté web).
type TeacherMenuAccess = {
  permission?: string | string[];
  homeroomOnly?: boolean;
};

export type TeacherMenuLink = TeacherMenuAccess & {
  type: "link";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: RoutePath;
};

export type TeacherMenuGroup = {
  type: "group";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: (TeacherMenuAccess & { label: string; href: RoutePath })[];
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
      {
        label: "Leçons",
        href: "/teacher/lessons",
        permission: "academics.lessons.view",
      },
      {
        label: "Cours",
        href: "/teacher/teaching-courses",
        permission: "academics.teachingCourses.view",
      },
    ],
  },
  {
    type: "link",
    label: "Évaluation",
    icon: "checkmark-done-outline",
    href: "/teacher/evaluations",
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
        href: "/teacher/course-averages",
        permission: [
          "academics.evaluations::reports::courseAverage.view",
          "academics.evaluations::courseEvaluations.view",
        ],
      },
      {
        label: "Palmarès",
        href: "/teacher/honor-roll",
        permission: [
          "academics.evaluations::reports::studentRanking.view",
          "academics.evaluations::courseEvaluations.view",
        ],
        homeroomOnly: true,
      },
      {
        label: "Appréciations",
        href: "/teacher/appraisals",
        permission: "academics.studentAppraisals.view",
        homeroomOnly: true,
      },

      {
        // En ligne uniquement ; l'API limite le titulaire à sa classe (EnrollmentDecisionPolicy).
        label: "Délibération",
        href: "/teacher/deliberation",
        permission: "academics.enrollmentDecisions.view",
        homeroomOnly: true,
      },

      {
        // Consultation en ligne uniquement ; l'API limite le titulaire à sa classe (gate manageReportCards).
        label: "Bulletins",
        href: "/teacher/report-cards",
        permission: "academics.evaluations::reports::studentReportCard.view",
        homeroomOnly: true,
      },
    ],
  },
  {
    type: "link",
    label: "Présences",
    icon: "checkbox-outline",
    href: "/teacher/attendance",
    permission: "attendance.records.view",
  },
  {
    type: "group",
    label: "Discipline",
    icon: "shield-outline",
    children: [
      {
        label: "Incident",
        href: "/teacher/incidents",
        permission: "discipline.incidents.view",
      },
      {
        label: "Sanction",
        href: "/teacher/sanctions",
        permission: "discipline.sanctions.view",
      },
      {
        label: "Règlement d'ordre intérieur",
        href: "/teacher/internal-regulations",
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
        href: "/teacher/schedule",
        permission: "academics.schedules::teaching.view",
      },
      { label: "Calendrier scolaire", href: "/teacher/calendar" },
    ],
  },
  {
    // Sans permission : /notifications ne renvoie que celles du compte.
    type: "link",
    label: "Notifications",
    icon: "notifications-outline",
    href: "/teacher/notifications",
  },
  {
    // Sans permission : /staff/announcements ne renvoie que les communiqués adressés au compte.
    type: "link",
    label: "Communiqués",
    icon: "megaphone-outline",
    href: "/teacher/announcements",
  },
  {
    type: "link",
    label: "Documents",
    icon: "folder-outline",
    href: "/teacher/documents",
    permission: "communication.documents.view",
  },
  {
    type: "link",
    label: "Messagerie",
    icon: "chatbubble-ellipses-outline",
    href: "/teacher/messaging",
    permission: "communication.conversations.view",
  },
  {
    type: "link",
    label: "Synchronisation",
    icon: "cloud-upload-outline",
    href: "/teacher/sync",
  },
  {
    type: "link",
    label: "Profil",
    icon: "person-outline",
    href: "/teacher/profil",
  },
];

function isAllowed(user: User | null, access: TeacherMenuAccess | undefined) {
  if (access?.homeroomOnly && !user?.isHomeroomTeacher) return false;

  const permissions = access?.permission ?? [];
  return (Array.isArray(permissions) ? permissions : [permissions]).every(
    (permission) => userCan(user, permission),
  );
}

// Comme useVisibleMenu côté web : une entrée sans permission disparaît, un groupe sans enfant visible aussi.
export function filterTeacherMenu(
  items: TeacherMenuItem[],
  user: User | null,
): TeacherMenuItem[] {
  return items.flatMap((item): TeacherMenuItem[] => {
    if (item.type === "link") {
      return isAllowed(user, item) ? [item] : [];
    }

    const children = item.children.filter((child) => isAllowed(user, child));
    return children.length > 0 ? [{ ...item, children }] : [];
  });
}

export function useVisibleTeacherMenu(): TeacherMenuItem[] {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => filterTeacherMenu(TEACHER_MENU, user), [user]);
}

// Pour une liste à plat (accès rapides de l'accueil) : même règle, à partir de la route.
export function useCanOpenTeacherRoute(): (href: RoutePath) => boolean {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => {
    const accessByHref = new Map<RoutePath, TeacherMenuAccess>();
    for (const item of TEACHER_MENU) {
      if (item.type === "link") accessByHref.set(item.href, item);
      else
        item.children.forEach((child) => accessByHref.set(child.href, child));
    }
    return (href) => isAllowed(user, accessByHref.get(href));
  }, [user]);
}
