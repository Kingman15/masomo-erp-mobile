export interface TeachingCourseEvaluationQuestionDTO {
  id: string | null;
  questionNo: number | null;
  questionType: "text" | null;

  questionText: string | null;

  properties: Partial<TeachingCourseEvaluationQuestionTextProperties> | null;

  correctAnswer: Partial<TeachingCourseEvaluationQuestionTextCorrectAnswer> | null;

  gradingConfig: Partial<TeachingCourseEvaluationQuestionGradingConfig> | null;

  weight: number | null;

  isRequired: boolean | null;
  isActive: boolean | null;

  feedbackCorrect: string | null;
  feedbackIncorrect: string | null;
  feedbackPartial: string | null;

  comments: string | null;

  // ---

  _tempId: string | null;
  _delete?: boolean;

  // ---

  questionTypeStr?: string | null;
}

export interface TeachingCourseEvaluationQuestionGradingConfig {
  partialCredit?: boolean | null; // Points partiels pour les réponses partiellement correctes.
  negativeMarking?: boolean | null; // Retirer des points pour les réponses incorrectes.
  negativePoints?: number | null; // Points négatifs à retirer pour une réponse incorrecte.
  tolerance?: number | null; // Marge d'erreur acceptable pour les réponses numériques.
}

// ============================================================================
// TEXT QUESTION TYPE
// ============================================================================

export interface TeachingCourseEvaluationQuestionTextProperties {
  maxLength: number | null;
  minLength: number | null;
  placeholder: string | null;
  multiline: boolean | null;
}

export interface TeachingCourseEvaluationQuestionTextCorrectAnswer {
  answerText: string | null;
  keywords: string[] | null;
}
