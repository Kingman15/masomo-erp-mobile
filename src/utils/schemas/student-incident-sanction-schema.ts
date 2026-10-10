import { STUDENT_INCIDENT_SANCTION_STATUSES } from "@/utils/types/StudentIncidentSanction";
import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Aligné sur StudentIncidentSanctionSchema du web, sans les champs d'appel (conservés tels quels à la modification).
export const studentIncidentSanctionSchema = z
  .object({
    studentId: z
      .string({ required_error: "L'élève est requis" })
      .uuid("L'élève est requis"),
    sanctionTypeId: z
      .string({ required_error: "Le type de sanction est requis" })
      .uuid("Le type de sanction est requis"),
    status: z.enum(STUDENT_INCIDENT_SANCTION_STATUSES, {
      required_error: "Le statut est requis",
    }),
    startsAt: z.string().regex(DATE_REGEX, "Date invalide").nullable().optional(),
    endsAt: z.string().regex(DATE_REGEX, "Date invalide").nullable().optional(),
    decidedAt: z
      .string({ required_error: "La date de décision est requise" })
      .regex(DATE_REGEX, "La date de décision est requise"),
    decidedBy: z.string().uuid("Le décideur est invalide").nullable().optional(),
    justification: z.string().max(2000).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    parentsNotified: z.boolean(),
    parentsNotifiedAt: z.string().regex(DATE_REGEX, "Date invalide").nullable().optional(),
  })
  .refine((data) => !(data.startsAt && data.endsAt && data.endsAt < data.startsAt), {
    message: "La date de fin doit suivre la date de début",
    path: ["endsAt"],
  })
  .refine((data) => !(data.parentsNotified && !data.parentsNotifiedAt), {
    message: "La date de notification est requise lorsque les parents ont été notifiés",
    path: ["parentsNotifiedAt"],
  });

export type StudentIncidentSanctionFormValues = z.infer<
  typeof studentIncidentSanctionSchema
>;
