import { z } from "zod";

export const schoolCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Le code doit contenir au moins 3 caractères")
    .max(20, "Code invalide"),
});

export const credentialsSchema = z.object({
  schoolCode: z
    .string()
    .min(3, "Le code doit contenir au moins 3 caractères")
    .max(20, "Code invalide"),

  username: z.string().min(1, "Nom d'utilisateur / e-mail est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type SchoolCodeForm = z.infer<typeof schoolCodeSchema>;
export type CredentialsForm = z.infer<typeof credentialsSchema>;
