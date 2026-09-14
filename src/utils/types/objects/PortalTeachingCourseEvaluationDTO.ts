import { TeachingCourseEvaluationDocument } from "../TeachingCourseEvaluationDocument";
import { PortalTeachingCourseEvaluationQuestionDTO } from "./PortalTeachingCourseEvaluationQuestionDTO";

export interface PortalTeachingCourseEvaluationDTO {
  id: string;

  course: {
    id: string;
    name: string;
    shortName: string | null;
  };

  evaluationPeriod: {
    id: string;
    name: string;
  };

  evaluationType: string | null;
  wording: string | null;
  evaluationDate: string | null;
  dueDate: string | null;

  maxScore: string;
  weight: string;

  countsTowardsFinal: boolean;
  comments: string | null;

  documents: TeachingCourseEvaluationDocument[] | null;
  questions: PortalTeachingCourseEvaluationQuestionDTO[] | null;
}
