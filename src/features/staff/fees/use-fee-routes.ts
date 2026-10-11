import { useSegments, type Href } from "expo-router";

// Piles qui déclarent les écrans de frais partagés (student-fees, fee-payment, derogation, derogation-new).
const FEE_STACKS = ["students", "fees", "fee-derogations"] as const;

/**
 * Liens vers les écrans de frais partagés, dans la pile courante du menu : le retour suit l'historique
 * (sinon l'écran s'ouvre dans la pile d'une autre entrée et le retour atterrit sur sa liste).
 * Chaque pile de FEE_STACKS déclare les mêmes routes, voir app/staff/<pile>/.
 */
export function useFeeRoutes() {
  const segments = useSegments() as string[];
  const stack = FEE_STACKS.find((name) => name === segments[1]) ?? "students";
  const root = `/staff/${stack}`;

  return {
    studentFees: (enrollmentId: string) => `${root}/student-fees/${enrollmentId}` as Href,
    feePayment: (feePaymentId: string) => `${root}/fee-payment/${feePaymentId}` as Href,
    derogation: (derogationId: string) => `${root}/derogation/${derogationId}` as Href,
    newDerogation: (enrollmentId?: string) =>
      (enrollmentId ? `${root}/derogation-new?enrollmentId=${enrollmentId}` : `${root}/derogation-new`) as Href,
  };
}
