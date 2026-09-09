import { z } from "zod";

export const teachingCourseEvaluationResultSchema = z.object({
  evaluationId: z.string().uuid(),
  results: z
    .array(
      z.object({
        enrollmentId: z.string().uuid(),
        score: z.coerce
          .number()
          .min(0, "Le score doit être supérieur ou égal à 0")
          .nullish(),
      }),
    )
    .min(1, "Au moins une cotation est requise"),
});

export type TeachingCourseEvaluationResultFormValues = z.infer<
  typeof teachingCourseEvaluationResultSchema
>;
