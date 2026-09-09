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

// Une entrée par élève inscrit (score/status null tant que non noté),
// renvoyée par GET /teaching-course-evaluation-results/get-by-evaluation/{evaluationId}
export interface TeachingCourseEvaluationResultRosterEntry {
  id: string | null;
  enrollmentId: string;
  score: string | null;
  status: TeachingCourseEvaluationResultStatus | null;
  comments: string | null;
  enrollment: Enrollment;
}
