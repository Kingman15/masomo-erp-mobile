import { SchoolYearTerm } from "@/utils/types/SchoolYearTerm";

type TermLike = Pick<
  SchoolYearTerm,
  "schoolYearId" | "schoolYearSubdivisionId" | "subdivisionNo" | "schoolYearSubdivision"
>;

const siblingKey = (term: TermLike) =>
  `${term.schoolYearId}|${term.schoolYearSubdivisionId}`;

/** Nombre de terms par (année, subdivision), pour décider si le numéro doit être affiché. */
export function countSchoolYearTermSiblings(
  terms: TermLike[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const term of terms) {
    counts.set(siblingKey(term), (counts.get(siblingKey(term)) ?? 0) + 1);
  }
  return counts;
}

/**
 * Libellé d'un term. Le numéro n'apparaît que si l'année compte plusieurs terms de la même subdivision :
 * « Trimestre 2 », mais « Année scolaire » et non « Année scolaire 1 ».
 */
export function formatSchoolYearTermLabel(
  term: TermLike,
  siblingCounts: Map<string, number>,
): string {
  const name = term.schoolYearSubdivision?.displayName ?? "Subdivision";
  return (siblingCounts.get(siblingKey(term)) ?? 0) > 1
    ? `${name} ${term.subdivisionNo}`
    : name;
}
