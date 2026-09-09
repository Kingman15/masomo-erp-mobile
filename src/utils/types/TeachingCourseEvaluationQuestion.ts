import { JsonObject, JsonValue } from "./Json";

export interface TeachingCourseEvaluationQuestion {
  id: string;
  code: string;
  evaluationId: string;

  questionNo: number;
  questionType: string;
  questionText: string | null;

  properties: JsonObject | null;
  correctAnswer: JsonValue | null;
  gradingConfig: JsonObject | null;

  weight: number | null;
  feedbackCorrect: string | null;
  feedbackIncorrect: string | null;
  feedbackPartial: string | null;

  isRequired: boolean;
  isActive: boolean;
  comments: string | null;
}
