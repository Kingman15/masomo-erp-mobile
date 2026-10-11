import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const comments = z.string().trim().max(1000, "Le commentaire ne doit pas dépasser 1000 caractères").nullable().optional();

// Ajout d'une dérogation sur une tranche non soldée. Le délai (date d'expiration) est celui demandé par le parent :
// toujours saisi, même pour une demande en attente ; l'école l'accorde ou le raccourcit au traitement.
// La décision n'est proposée qu'avec schoolFees.derogations.process.
export const feePaymentDerogationRequestSchema = z.object({
  feeInstallmentId: z.string({ required_error: "Choisissez la tranche concernée" }).min(1, "Choisissez la tranche concernée"),
  reason: z.string().trim().max(1000, "Le motif ne doit pas dépasser 1000 caractères").nullable().optional(),
  status: z.enum(["pending", "approved", "rejected"]),
  expirationDate: z
    .string({ required_error: "Indiquez le délai demandé", invalid_type_error: "Indiquez le délai demandé" })
    .regex(DATE_REGEX, "La date est invalide"),
  comments,
});

export type FeePaymentDerogationRequestFormValues = z.infer<typeof feePaymentDerogationRequestSchema>;

// Décision : l'approbation fixe le délai accordé (exigé par l'API), le refus non.
export const feePaymentDerogationProcessSchema = z
  .object({
    status: z.enum(["approved", "rejected"]),
    expirationDate: z.string().regex(DATE_REGEX, "La date est invalide").nullable().optional(),
    comments,
  })
  .refine((values) => values.status !== "approved" || Boolean(values.expirationDate), {
    path: ["expirationDate"],
    message: "Indiquez le délai accordé",
  });

export type FeePaymentDerogationProcessFormValues = z.infer<typeof feePaymentDerogationProcessSchema>;
