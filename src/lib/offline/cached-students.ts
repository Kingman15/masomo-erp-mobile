import { enrollmentKeys } from "@/utils/query-keys/enrollment";
import type { Enrollment } from "@/utils/types/Enrollment";
import type { Student } from "@/utils/types/Student";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

type EnrollmentListFilters = {
  schoolYearId?: string | null;
  withoutAttendanceSessionId?: string | null;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Élèves connus de l'appareil pour une année : ceux des listes complètes de classes gardées hors ligne (préchargées pour les classes de l'enseignant).
 * Sert de recherche locale quand la recherche serveur est impossible.
 */
export function useCachedStudents({
  schoolYearId,
  searchTerm,
  enabled,
}: {
  schoolYearId: string | null | undefined;
  searchTerm: string;
  enabled: boolean;
}): Student[] {
  const queryClient = useQueryClient();

  return useMemo(() => {
    if (!enabled || !schoolYearId) return [];

    const byId = new Map<string, Student>();

    for (const [queryKey, enrollments] of queryClient.getQueriesData<
      Enrollment[]
    >({ queryKey: [...enrollmentKeys.all, "list"] })) {
      const filters = queryKey[2] as EnrollmentListFilters | undefined;
      if (
        filters?.schoolYearId !== schoolYearId ||
        filters.withoutAttendanceSessionId
      ) {
        continue;
      }

      for (const enrollment of enrollments ?? []) {
        if (enrollment.student) byId.set(enrollment.student.id, enrollment.student);
      }
    }

    const term = normalize(searchTerm.trim());

    return [...byId.values()]
      .filter(
        (student) =>
          !term ||
          normalize(student.fullDesignation ?? "").includes(term) ||
          normalize(student.registrationNo ?? "").includes(term),
      )
      .sort((a, b) =>
        (a.fullDesignation ?? "").localeCompare(b.fullDesignation ?? ""),
      );
  }, [queryClient, schoolYearId, searchTerm, enabled]);
}
