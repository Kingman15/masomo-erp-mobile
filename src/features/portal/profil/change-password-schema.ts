import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis."),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères."),
    newPasswordConfirmation: z
      .string()
      .min(1, "La confirmation du mot de passe est requise."),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["newPasswordConfirmation"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
