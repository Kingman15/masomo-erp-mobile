import { Employee } from "./Employee";
import { EvaluationPeriod } from "./EvaluationPeriod";
import { TeachingCourse } from "./TeachingCourse";
import { TeachingCourseEvaluationQuestion } from "./TeachingCourseEvaluationQuestion";
import { TeachingCourseEvaluationType } from "./TeachingCourseEvaluationType";
import { User } from "./User";

export interface TeachingCourseEvaluation {
  id: string;
  code: string | null;
  teachingCourseId: string | null;
  evaluationPeriodId: string | null;
  evaluationTypeId: string | null;
  teacherId: string | null;
  evaluationDate: string | null;
  dueDate: string | null;
  wording: string | null;
  weight: number | null;
  maxScore: number | null;
  comments: string | null;

  publishedAt: string | null;
  publishedBy: string | null;

  countsTowardsFinal: boolean | null;
  exclusionReason: string | null;
  excludedBy: string | null;
  excludedAt: string | null;

  isVisibleToGuardians: boolean | null;
  isVisibleToStudents: boolean | null;

  // Relations ===

  teachingCourse: TeachingCourse | null;
  evaluationPeriod: EvaluationPeriod | null;
  evaluationType: TeachingCourseEvaluationType | null;
  teacher: Employee | null;
  publishedByUser: User | null;
  excludedByUser: User | null;

  questions?: TeachingCourseEvaluationQuestion[] | null;
}
