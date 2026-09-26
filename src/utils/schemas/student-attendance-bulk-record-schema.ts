import { z } from "zod";

export const studentAttendanceBulkRecordSchema = z.object({
  sessionId: z
    .string({ required_error: "La session de présences est requise" })
    .uuid("La session de présences est requise"),

  schoolClassId: z
    .string({ required_error: "La classe est requise" })
    .uuid("La classe est requise"),

  pointedById: z
    .string()
    .uuid("L'employé pointeur est requis")
    .nullable()
    .optional(),

  pointingChannelId: z
    .string()
    .uuid("Le canal de pointage est requis")
    .nullable()
    .optional(),

  location: z
    .string()
    .max(255, "Le lieu ne peut pas dépasser 255 caractères")
    .nullable()
    .optional(),
});

export type StudentAttendanceBulkRecordFormValues = z.infer<
  typeof studentAttendanceBulkRecordSchema
>;
