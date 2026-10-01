import { z } from "zod";

export const schoolCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Le code doit contenir au moins 3 caractères")
    .max(20, "Code invalide"),
});

// Le code école vient de l'école sélectionnée (store), pas d'un champ du formulaire
export const credentialsSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur / e-mail est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type SchoolCodeForm = z.infer<typeof schoolCodeSchema>;
export type CredentialsForm = z.infer<typeof credentialsSchema>;

// Activation parent : mêmes règles que le portail web (parent-activation-schema)

export const parentCodeCheckSchema = z.object({
  schoolCode: z.string().trim().min(1, "Le code école est requis"),
  activationCode: z
    .string()
    .trim()
    .min(1, "Le code d'activation est requis")
    .regex(/^\d{4}-\d{4}$/, "Le code d'activation est incomplet (8 chiffres)"),
});

export type ParentCodeCheckForm = z.infer<typeof parentCodeCheckSchema>;

export const parentActivationSchema = z
  .object({
    phone: z
      .string()
      .trim()
      .min(1, "Le numéro de téléphone est requis")
      .refine((value) => value.replace(/\D/g, "").length >= 8, "Le numéro de téléphone est incomplet"),
    username: z
      .string()
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
      .max(20, "Le nom d'utilisateur ne peut pas dépasser 20 caractères")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des underscores (_)",
      ),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    passwordConfirmation: z.string().min(1, "La confirmation du mot de passe est requise"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Les mots de passe ne correspondent pas",
  });

export type ParentActivationForm = z.infer<typeof parentActivationSchema>;

/** Code d'activation : 8 chiffres, tiret ajouté pendant la saisie ("12345678" -> "1234-5678") */
export function formatParentCode(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
}
