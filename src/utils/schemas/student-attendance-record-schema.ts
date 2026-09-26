import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export const studentAttendanceRecordSchema = z
  .object({
    sessionId: z
      .string({ required_error: "La session de présences est requise" })
      .uuid("La session de présences est requise"),

    enrollmentId: z
      .string({ required_error: "L'élève est requis" })
      .uuid("L'élève est requis"),

    pointingTypeId: z
      .string({ required_error: "Le type de pointage est requis" })
      .uuid("Le type de pointage est requis"),

    entryTime: z
      .string()
      .regex(TIME_REGEX, "L'heure d'arrivée doit être au format HH:mm")
      .nullable()
      .optional(),

    exitTime: z
      .string()
      .regex(TIME_REGEX, "L'heure de départ doit être au format HH:mm")
      .nullable()
      .optional(),

    isLate: z.boolean().nullable().optional(),
    isPartial: z.boolean().nullable().optional(),

    justificationStatusId: z
      .string()
      .uuid("Le statut de justification est invalide")
      .nullable()
      .optional(),

    justificationNote: z
      .string()
      .max(255, "La note de justification ne peut pas dépasser 255 caractères")
      .nullable()
      .optional(),

    justificationDate: z
      .string()
      .regex(DATE_REGEX, "La date de justification est invalide")
      .nullable()
      .optional(),

    pointingChannelId: z
      .string()
      .uuid("Le canal de pointage est invalide")
      .nullable()
      .optional(),

    location: z
      .string()
      .max(255, "Le lieu ne peut pas dépasser 255 caractères")
      .nullable()
      .optional(),

    note: z
      .string()
      .max(255, "La note ne peut pas dépasser 255 caractères")
      .nullable()
      .optional(),
  })
  .refine(
    ({ entryTime, exitTime }) => {
      if (!entryTime || !exitTime) return true;
      return timeToMinutes(exitTime) >= timeToMinutes(entryTime);
    },
    {
      message: "L'heure de départ doit être postérieure à l'heure d'arrivée",
      path: ["exitTime"],
    },
  )
  .refine(
    ({ justificationDate, justificationStatusId }) =>
      !justificationDate || !!justificationStatusId,
    {
      message:
        "Le statut de justification est requis si une date de justification est renseignée",
      path: ["justificationStatusId"],
    },
  )
  .refine(
    ({ justificationNote, justificationStatusId }) =>
      !justificationNote || !!justificationStatusId,
    {
      message:
        "Le statut de justification est requis si une note de justification est renseignée",
      path: ["justificationStatusId"],
    },
  );

export type StudentAttendanceRecordFormValues = z.infer<
  typeof studentAttendanceRecordSchema
>;
