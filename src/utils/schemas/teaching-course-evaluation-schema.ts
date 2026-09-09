import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const teachingCourseEvaluationQuestionSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  tempId: z.string(),
  isDeleted: z.boolean().optional(),

  questionNo: z.coerce
    .number({ required_error: "Le numéro de question est requis" })
    .int("Le numéro de question doit être un entier")
    .min(1, "Le numéro de question doit être supérieur ou égal à 1"),

  questionType: z.enum(["text"]),

  questionText: z
    .string({ required_error: "Le texte de la question est requis" })
    .min(1, "Le texte de la question est requis"),

  weight: z.coerce
    .number({ required_error: "Points requis" })
    .min(0, "Les points doivent être supérieurs ou égaux à 0"),

  correctAnswerText: z.string().nullable().optional(),
  correctAnswerKeywords: z.array(z.string()).nullable().optional(),

  comments: z
    .string()
    .max(255, "Les commentaires ne peuvent pas dépasser 255 caractères")
    .nullable()
    .optional(),
});

export type TeachingCourseEvaluationQuestionFormValues = z.infer<
  typeof teachingCourseEvaluationQuestionSchema
>;

export const teachingCourseEvaluationSchema = z
  .object({
    schoolYearId: z
      .string({ required_error: "L'année scolaire est requise" })
      .uuid("L'année scolaire est invalide"),

    schoolClassId: z
      .string({ required_error: "La classe scolaire est requise" })
      .uuid("La classe scolaire est invalide"),

    courseId: z
      .string({ required_error: "Le cours est requis" })
      .uuid("Le cours est invalide"),

    evaluationTypeId: z
      .string({ required_error: "Le type d'évaluation est requis" })
      .uuid("Le type d'évaluation est invalide"),

    evaluationPeriodId: z
      .string({ required_error: "La période d'évaluation est requise" })
      .uuid("La période d'évaluation est invalide"),

    weight: z.coerce
      .number({ required_error: "Pondération requise" })
      .min(0, "La pondération doit être supérieure ou égale à 0"),

    maxScore: z.coerce
      .number({ required_error: "Noté sur requis" })
      .min(0, "La note maximale doit être supérieure ou égale à 0"),

    evaluationDate: z
      .string({ required_error: "Date d'évaluation requise" })
      .regex(DATE_REGEX, "La date d'évaluation est invalide"),

    dueDate: z
      .string()
      .regex(DATE_REGEX, "La date limite est invalide")
      .nullable()
      .optional(),

    wording: z
      .string({
        required_error: "Le libellé de l'évaluation de cours est requis",
      })
      .min(1, "Le libellé de l'évaluation de cours est requis")
      .max(255, "Le libellé de l'évaluation ne peut pas dépasser 255 caractères"),

    comments: z
      .string()
      .max(255, "Les commentaires ne peuvent pas dépasser 255 caractères")
      .nullable()
      .optional(),

    questions: z
      .array(teachingCourseEvaluationQuestionSchema)
      .min(1, "Au moins une question est requise pour l'évaluation de cours"),

    isVisibleToGuardians: z.boolean(),
    isVisibleToStudents: z.boolean(),
    countsTowardsFinal: z.boolean(),

    publish: z.boolean().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const seenAt = new Map<number, number>();

    data.questions.forEach((question, index) => {
      if (question.isDeleted) return;

      const firstIndex = seenAt.get(question.questionNo);
      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Pas deux questions avec le même numéro",
          path: ["questions", index, "questionNo"],
        });
      } else {
        seenAt.set(question.questionNo, index);
      }
    });
  });

export type TeachingCourseEvaluationFormValues = z.infer<
  typeof teachingCourseEvaluationSchema
>;

export const teachingCourseEvaluationPublishSchema = z.object({
  dueDate: z
    .string()
    .regex(DATE_REGEX, "La date limite est invalide")
    .nullable()
    .optional(),
});

export type TeachingCourseEvaluationPublishFormValues = z.infer<
  typeof teachingCourseEvaluationPublishSchema
>;

export const teachingCourseEvaluationCountsTowardsFinalSchema = z.object({
  countsTowardsFinal: z.boolean({
    required_error: "'Compte dans la moyenne' requis",
  }),
  exclusionReason: z
    .string()
    .max(255, "La raison ne doit pas dépasser 255 caractères")
    .nullable()
    .optional(),
});

export type TeachingCourseEvaluationCountsTowardsFinalFormValues = z.infer<
  typeof teachingCourseEvaluationCountsTowardsFinalSchema
>;
