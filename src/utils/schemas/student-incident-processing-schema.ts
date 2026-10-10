import { STUDENT_INCIDENT_STATUSES } from "@/utils/types/StudentIncident";
import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Traitement d'un incident (directeur de discipline) : partie « suivi » du StudentIncidentSchema du web.
export const studentIncidentProcessingSchema = z
  .object({
    status: z.enum(STUDENT_INCIDENT_STATUSES, {
      required_error: "Le statut est requis",
    }),
    severityLevel: z.coerce
      .number()
      .int("Doit être un entier")
      .min(1, "Entre 1 et 5")
      .max(5, "Entre 1 et 5")
      .nullable()
      .optional(),
    handledBy: z.string().uuid("Le responsable est invalide").nullable().optional(),

    temporaryMeasureApplied: z.boolean(),
    temporaryMeasureDescription: z
      .string()
      .max(1000, "La description ne peut pas dépasser 1000 caractères")
      .nullable()
      .optional(),
    measuresTaken: z
      .string()
      .max(2000, "Les mesures prises ne peuvent pas dépasser 2000 caractères")
      .nullable()
      .optional(),
    resolvedAt: z.string().regex(DATE_REGEX, "Date invalide").nullable().optional(),

    psychologicalSupportRequired: z.boolean(),
    psychologicalSupportNotes: z
      .string()
      .max(2000, "Les notes ne peuvent pas dépasser 2000 caractères")
      .nullable()
      .optional(),

    parentsNotified: z.boolean(),
    parentsNotifiedAt: z
      .string()
      .regex(DATE_REGEX, "Date invalide")
      .nullable()
      .optional(),
    parentsNotifiedBy: z
      .string()
      .uuid("Le notificateur est invalide")
      .nullable()
      .optional(),

    internalNotes: z
      .string()
      .max(2000, "Les notes internes ne peuvent pas dépasser 2000 caractères")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => !(data.temporaryMeasureApplied && !data.temporaryMeasureDescription),
    {
      message: "Une description est requise lorsqu'une mesure temporaire est appliquée",
      path: ["temporaryMeasureDescription"],
    },
  )
  .refine(
    (data) => !(data.psychologicalSupportRequired && !data.psychologicalSupportNotes),
    {
      message: "Des notes sont requises lorsque le soutien psychologique est nécessaire",
      path: ["psychologicalSupportNotes"],
    },
  )
  .refine((data) => !(data.parentsNotified && !data.parentsNotifiedAt), {
    message: "La date de notification est requise lorsque les parents ont été notifiés",
    path: ["parentsNotifiedAt"],
  });

export type StudentIncidentProcessingFormValues = z.infer<
  typeof studentIncidentProcessingSchema
>;
