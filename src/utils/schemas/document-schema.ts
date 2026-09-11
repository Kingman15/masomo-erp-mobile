import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const DOCUMENT_SHARE_AUDIENCE_TYPES = [
  "school",
  "section",
  "option",
  "generalClass",
  "schoolClass",
] as const;

export const documentShareFormSchema = z
  .object({
    tempId: z.string(),
    audienceType: z.enum(DOCUMENT_SHARE_AUDIENCE_TYPES, {
      required_error: "Le type d'audience est requis",
    }),
    audienceId: z.string().uuid("Sélection invalide").nullable().optional(),
    audienceLabel: z.string().nullable().optional(),
    publishedAt: z
      .string()
      .regex(DATE_REGEX, "Date invalide")
      .nullable()
      .optional(),
    expiresAt: z
      .string()
      .regex(DATE_REGEX, "Date invalide")
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.audienceType !== "school" && !data.audienceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Veuillez sélectionner une audience pour ce type.",
        path: ["audienceId"],
      });
    }
    if (
      data.publishedAt &&
      data.expiresAt &&
      data.expiresAt < data.publishedAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "La date d'expiration doit être postérieure ou égale à la date de publication.",
        path: ["expiresAt"],
      });
    }
  });

export type DocumentShareFormValues = z.infer<typeof documentShareFormSchema>;

export const documentFormSchema = z.object({
  title: z
    .string({ required_error: "Le titre est requis" })
    .min(1, "Le titre est requis")
    .max(255, "Le titre ne peut pas dépasser 255 caractères"),
  description: z
    .string()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .nullable()
    .optional(),
  category: z
    .string()
    .max(100, "La catégorie ne peut pas dépasser 100 caractères")
    .nullable()
    .optional(),
  schoolYearId: z.string().uuid().nullable().optional(),
  shares: z
    .array(documentShareFormSchema)
    .min(1, "Veuillez ajouter au moins un partage."),
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
