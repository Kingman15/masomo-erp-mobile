// Élèves d'une classe dans l'ordre du pointage.
// Partagé par l'écran de pointage et le préchargement hors ligne : les clés de cache doivent être identiques.

export function classEnrollmentsFilters(
  schoolYearId: string | null,
  schoolClassId: string | null,
  withoutAttendanceSessionId: string | null = null,
) {
  return {
    schoolYearId,
    schoolClassId,
    sortBy: "student_name",
    sortDirection: "asc" as const,
    withoutAttendanceSessionId,
  };
}
