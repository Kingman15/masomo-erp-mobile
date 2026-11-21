import { z } from "zod";

/**
 * Longueur minimale de l'utilisateur connecté (User.passwordMinLength, PasswordPolicy côté API) : 6 portail, 8 personnel.
 * Utilisateur gardé par une version antérieure de l'app (champ absent) : déduite du rôle.
 */
export function passwordMinLengthFor(
  user: { passwordMinLength?: number; role?: { roleCategory?: string } | null } | null,
): number {
  return user?.passwordMinLength ?? (user?.role?.roleCategory === "portal" ? 6 : 8);
}

export const getChangePasswordSchema = (minLength: number) =>
  z
    .object({
      currentPassword: z.string().min(1, "Le mot de passe actuel est requis."),
      newPassword: z
        .string()
        .min(minLength, `Le nouveau mot de passe doit contenir au moins ${minLength} caractères.`),
      newPasswordConfirmation: z
        .string()
        .min(1, "La confirmation du mot de passe est requise."),
    })
    .refine((data) => data.newPassword === data.newPasswordConfirmation, {
      message: "Les mots de passe ne correspondent pas.",
      path: ["newPasswordConfirmation"],
    });

export type ChangePasswordFormValues = z.infer<ReturnType<typeof getChangePasswordSchema>>;
