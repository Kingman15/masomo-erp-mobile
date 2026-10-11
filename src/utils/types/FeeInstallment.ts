// Tranche d'un frais affecté à une classe générique (grille des frais, consultation).
export interface FeeInstallment {
  id: string;
  code: string | null;
  feeAssignmentId: string;
  installmentNumber: number;
  dueDate: string | null;
  amount: string;
  amountDueStr: string | null;
  description: string | null;

  feeAssignment: {
    id: string;
    currency: string | null;
    amountStr: string | null;
    dueDate: string | null;
    fee: {
      id: string;
      designation: string | null;
      feeType: { id: string; title: string | null } | null;
    } | null;
  } | null;
}
