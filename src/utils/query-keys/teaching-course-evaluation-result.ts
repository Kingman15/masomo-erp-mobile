export const teachingCourseEvaluationResultKeys = {
  all: ["teaching-course-evaluation-results"] as const,

  // Clé unique partagée entre le wizard de cotation et la future grille de
  // l'onglet "Résultats", pour éviter la désynchronisation de caches
  // observée côté web (cf. spec §7.6 / §10 point 8).
  roster: (evaluationId?: string) =>
    [...teachingCourseEvaluationResultKeys.all, "roster", evaluationId] as const,
};
