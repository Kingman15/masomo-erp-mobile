import { INCIDENT_STUDENT_ROLES } from "@/utils/types/IncidentStudent";
import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const incidentStudentFormSchema = z.object({
  tempId: z.string(),
  studentId: z
    .string({ required_error: "L'élève est requis" })
    .uuid("L'élève est invalide"),
  studentLabel: z.string().nullable().optional(),
  role: z.enum(INCIDENT_STUDENT_ROLES, {
    required_error: "Le rôle est requis",
  }),
  notes: z
    .string()
    .max(1000, "Les notes ne peuvent pas dépasser 1000 caractères")
    .nullable()
    .optional(),
});

export type IncidentStudentFormValues = z.infer<
  typeof incidentStudentFormSchema
>;

export const teacherStudentIncidentSchema = z
  .object({
    schoolYearId: z
      .string({ required_error: "L'année scolaire est requise" })
      .uuid("L'année scolaire est invalide"),

    incidentTypeId: z
      .string()
      .uuid("Le type d'incident est invalide")
      .nullable()
      .optional(),

    mainStudentId: z
      .string()
      .uuid("L'élève principal est invalide")
      .nullable()
      .optional(),
    mainStudentLabel: z.string().nullable().optional(),

    occurredAtDate: z
      .string({ required_error: "La date de l'incident est requise" })
      .regex(DATE_REGEX, "Date invalide"),
    occurredAtTime: z
      .string()
      .regex(TIME_REGEX, "Heure invalide (HH:mm)")
      .nullable()
      .optional(),

    reportedAtDate: z
      .string()
      .regex(DATE_REGEX, "Date invalide")
      .nullable()
      .optional(),
    reportedAtTime: z
      .string()
      .regex(TIME_REGEX, "Heure invalide (HH:mm)")
      .nullable()
      .optional(),

    severityLevel: z.coerce
      .number()
      .int("Doit être un entier")
      .min(1, "Entre 1 et 5")
      .max(5, "Entre 1 et 5")
      .nullable()
      .optional(),

    location: z
      .string()
      .max(255, "Le lieu ne peut pas dépasser 255 caractères")
      .nullable()
      .optional(),

    description: z
      .string()
      .max(2000, "La description ne peut pas dépasser 2000 caractères")
      .nullable()
      .optional(),

    students: z.array(incidentStudentFormSchema),
  })
  .refine((data) => data.students.length > 0, {
    message: "Au moins un élève concerné est requis",
    path: ["students"],
  });

export type TeacherStudentIncidentFormValues = z.infer<
  typeof teacherStudentIncidentSchema
>;
