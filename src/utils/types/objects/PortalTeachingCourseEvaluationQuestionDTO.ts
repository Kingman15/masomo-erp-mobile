import { TeachingCourseEvaluationQuestionTextProperties } from "./TeachingCourseEvaluationQuestionDTO";

export interface PortalTeachingCourseEvaluationQuestionDTO {
  id: string;
  questionNo: number | null;
  questionType: "text" | null;

  questionText: string | null;

  properties: Partial<TeachingCourseEvaluationQuestionTextProperties> | null;

  weight: string;

  isRequired: boolean;
}
