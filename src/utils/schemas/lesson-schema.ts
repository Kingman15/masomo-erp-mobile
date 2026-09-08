import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const lessonSchema = z
  .object({
    fileNo: z
      .string({ required_error: "Le numéro de fiche est requis" })
      .min(1, "Le numéro de fiche est requis")
      .max(50, "Le numéro de fiche ne peut pas dépasser 50 caractères"),

    subject: z
      .string({ required_error: "Le sujet de la leçon est requis" })
      .min(1, "Le sujet de la leçon est requis")
      .max(255, "Le sujet de la leçon ne peut pas dépasser 255 caractères"),

    lessonDate: z
      .string({ required_error: "La date de la leçon est requise" })
      .regex(DATE_REGEX, "La date de la leçon est invalide"),

    startTime: z
      .string({ required_error: "L'heure de début est requise" })
      .regex(TIME_REGEX, "Heure de début invalide (HH:mm)"),

    endTime: z
      .string({ required_error: "L'heure de fin est requise" })
      .regex(TIME_REGEX, "Heure de fin invalide (HH:mm)"),

    schoolYearId: z
      .string({ required_error: "L'année scolaire est requise" })
      .uuid("L'année scolaire est invalide"),

    schoolClassId: z
      .string({ required_error: "La classe scolaire est requise" })
      .uuid("La classe scolaire est invalide"),

    courseId: z
      .string({ required_error: "Le cours est requis" })
      .uuid("Le cours est invalide"),

    classroomId: z
      .string()
      .uuid("L'espace d'enseignement est invalide")
      .nullable()
      .optional(),

    comments: z
      .string()
      .max(255, "Les commentaires ne peuvent pas dépasser 255 caractères")
      .nullable()
      .optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "L'heure de fin doit être après l'heure de début",
    path: ["endTime"],
  });

export type LessonFormValues = z.infer<typeof lessonSchema>;
