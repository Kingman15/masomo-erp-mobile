import { Enrollment } from "./Enrollment";
import { TeachingCourseEvaluation } from "./TeachingCourseEvaluation";

export const TEACHING_COURSE_EVALUATION_RESULT_STATUSES = [
  "draft",
  "submitted",
  "approved",
  "rejected",
] as const;

export type TeachingCourseEvaluationResultStatus =
  (typeof TEACHING_COURSE_EVALUATION_RESULT_STATUSES)[number];

export interface TeachingCourseEvaluationResult {
  id: string;
  code: string | null;
  enrollmentId: string | null;
  evaluationId: string | null;
  score: string | null; // BigDecimal API renvoyé en string
  status: TeachingCourseEvaluationResultStatus | null;
  comments: string | null;

  enrollment: Enrollment | null;
  evaluation: TeachingCourseEvaluation | null;
}

// Une entrée par élève inscrit (score null tant que non noté), renvoyée par
// GET /teaching-course-evaluation-results/get-by-evaluation/{evaluationId}.
// L'API (TeachingCourseEvaluationResultDTOResource) ne renvoie que ces deux
// champs — pas de `id`/`enrollmentId`/`status`/`comments` à plat : l'UUID de
// l'inscription se lit via `enrollment.id` (cf. web:
// teaching-course-evaluation-result-wizard-form-dialog.tsx, qui fait pareil).
export interface TeachingCourseEvaluationResultRosterEntry {
  score: string | null;
  enrollment: Enrollment;
}
