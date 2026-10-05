import {
  onlineManager,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useCallback } from "react";
import { toastNotify } from "@/lib/toast";
import { toLocalIsoString } from "./client-metadata";
import {
  markQueued,
  OFFLINE_MUTATION_ROOT,
  type OfflinePayloads,
  type OfflineVariables,
} from "./offline-mutations";
import { getOfflineOwner } from "./owner";

/** Retour commun des écrans quand l'envoi part en file. */
export function notifyQueued() {
  toastNotify(
    "Enregistré sur l'appareil, envoi au retour du réseau.",
    "info",
  );
}

export type OfflineSubmitResult<TResult> =
  // Le serveur a répondu (en ligne) : même traitement qu'avant côté écran.
  | { status: "done"; data: TResult }
  // Hors ligne ou réseau en échec : l'envoi partira seul au retour du réseau.
  | { status: "queued" };

/**
 * Soumission d'une écriture rejouable.
 *
 * - En ligne et serveur joignable : attend la réponse. Un refus (409, 422, 5xx…) est rejeté sans nouvel essai comme OfflineMutationError ; `error.cause` porte l'AxiosError d'origine, pour handleApiError.
 * - Sinon : résout `queued` dès que l'envoi est mis en attente, pour que l'écran se ferme sans attendre le serveur.
 */
export function useOfflineMutation<
  K extends keyof OfflinePayloads,
  TResult = unknown,
>(name: K) {
  const queryClient = useQueryClient();
  const mutationKey = [OFFLINE_MUTATION_ROOT, name] as const;

  const mutation = useMutation<
    TResult,
    Error,
    OfflineVariables<OfflinePayloads[K]>
  >({ mutationKey });

  const { mutateAsync } = mutation;

  const submit = useCallback(
    (
      payload: OfflinePayloads[K],
      label: string,
      // Renvoi d'une saisie antérieure (ex. en ignorant les conflits) : garde l'heure de la saisie d'origine.
      recordedAt?: string,
    ): Promise<OfflineSubmitResult<TResult>> => {
      const now = new Date();
      const variables: OfflineVariables<OfflinePayloads[K]> = {
        // Générée ici, une seule fois : chaque nouvel essai réutilise la même clé.
        idempotencyKey: Crypto.randomUUID(),
        owner: getOfflineOwner(),
        payload,
        label,
        queuedAt: now.toISOString(),
        // Heure de la saisie, envoyée à l'API telle que l'appareil la connaît.
        recordedAt: recordedAt ?? toLocalIsoString(now),
      };

      const queue = (
        resolve: (result: OfflineSubmitResult<TResult>) => void,
      ) => {
        markQueued(variables.idempotencyKey);
        resolve({ status: "queued" });
      };

      const queued = new Promise<OfflineSubmitResult<TResult>>((resolve) => {
        if (!onlineManager.isOnline()) {
          queue(resolve);
          return;
        }

        // En ligne selon NetInfo mais serveur injoignable : mis en file au premier échec réseau (ou à la mise en pause si la connexion tombe).
        const unsubscribe = queryClient
          .getMutationCache()
          .subscribe((event) => {
            const state = event.mutation?.state;
            const eventVariables = state?.variables as
              | OfflineVariables
              | undefined;
            if (
              !state ||
              eventVariables?.idempotencyKey !== variables.idempotencyKey
            ) {
              return;
            }

            if (
              state.status === "pending" &&
              (state.isPaused || state.failureCount > 0)
            ) {
              unsubscribe();
              queue(resolve);
            } else if (state.status === "success" || state.status === "error") {
              unsubscribe();
            }
          });
      });

      const done = mutateAsync(variables).then(
        (data): OfflineSubmitResult<TResult> => ({ status: "done", data }),
      );

      return Promise.race([done, queued]);
    },
    [mutateAsync, queryClient],
  );

  return { submit, isPending: mutation.isPending && !mutation.isPaused };
}
