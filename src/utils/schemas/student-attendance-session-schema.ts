import { z } from "zod";

// Aligné sur StudentAttendanceSessionSchema du web, réduit aux champs saisis sur mobile (session ouverte, sans leçon ni vacation).
export const studentAttendanceSessionSchema = z.object({
  registerId: z
    .string({ message: "Le registre de présence est requis" })
    .uuid("Le registre de présence est requis"),
  attendanceDate: z
    .string({ message: "La date de présence est requise" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date de présence est requise"),
  arrivalTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "L'heure d'arrivée doit être au format HH:mm")
    .nullable()
    .optional(),
  departureTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "L'heure de départ doit être au format HH:mm")
    .nullable()
    .optional(),
  title: z
    .string()
    .max(255, "Le titre ne peut pas dépasser 255 caractères")
    .nullable()
    .optional(),
  description: z
    .string()
    .max(255, "La description ne peut pas dépasser 255 caractères")
    .nullable()
    .optional(),
});

export type StudentAttendanceSessionFormValues = z.infer<
  typeof studentAttendanceSessionSchema
>;
