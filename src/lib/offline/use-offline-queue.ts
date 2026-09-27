import {
  onlineManager,
  useMutationState,
  type Mutation,
  type QueryClient,
} from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { getOfflineFailure, type OfflineFailure } from "./offline-error";
import {
  isQueued,
  OFFLINE_MUTATION_ROOT,
  type OfflinePayloads,
  type OfflineVariables,
} from "./offline-mutations";

export interface OfflineQueueItem {
  mutationId: number;
  name: keyof OfflinePayloads;
  label: string;
  queuedAt: string;
  // Heure de la saisie envoyée à l'API (cf. OfflineVariables.recordedAt).
  recordedAt: string;
  // Données saisies (type selon `name`, cf. OfflinePayloads).
  payload: unknown;
  // waiting : en attente du réseau ; sending : essai en cours ; failed : refusé (à traiter)
  state: "waiting" | "sending" | "failed";
  failureCount: number;
  failure: OfflineFailure | null;
}

function toQueueItem(mutation: Mutation<unknown, Error, unknown, unknown>): OfflineQueueItem | null {
  const { status, isPaused, failureCount, error } = mutation.state;
  const variables = mutation.state.variables as OfflineVariables | undefined;

  if (!variables || (status !== "pending" && status !== "error")) return null;

  // Envoi direct en cours (en ligne, l'écran qui l'a lancé attend la réponse) : pas encore dans la file.
  // Il y entre s'il échoue sur le réseau ou se met en pause (markQueued).
  if (status === "pending" && !isQueued(variables.idempotencyKey)) return null;

  return {
    mutationId: mutation.mutationId,
    name: (mutation.options.mutationKey?.[1] ?? "") as keyof OfflinePayloads,
    label: variables.label,
    queuedAt: variables.queuedAt,
    recordedAt: variables.recordedAt ?? variables.queuedAt,
    payload: variables.payload,
    state: status === "error" ? "failed" : isPaused ? "waiting" : "sending",
    failureCount,
    failure: status === "error" ? getOfflineFailure(error) : null,
  };
}

/** Envois en attente et refusés, dans l'ordre de saisie. */
export function useOfflineQueue(): OfflineQueueItem[] {
  const items = useMutationState({
    filters: { mutationKey: [OFFLINE_MUTATION_ROOT] },
    select: (mutation) => toQueueItem(mutation),
  });

  return items.filter((item): item is OfflineQueueItem => item !== null);
}

export function useOfflineQueueCounts() {
  const items = useOfflineQueue();

  return {
    pending: items.filter((item) => item.state !== "failed").length,
    failed: items.filter((item) => item.state === "failed").length,
  };
}

export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}

/** Retire un envoi refusé de la file (« Ignorer »). */
export function dismissOfflineItem(queryClient: QueryClient, mutationId: number) {
  const mutationCache = queryClient.getMutationCache();
  const mutation = mutationCache.getAll().find((item) => item.mutationId === mutationId);

  if (mutation && mutation.state.status === "error") {
    mutationCache.remove(mutation);
  }
}

/** Nombre d'envois non encore acceptés par le serveur (avertissement à la déconnexion). */
export function countUnsyncedOfflineItems(queryClient: QueryClient): number {
  return queryClient
    .getMutationCache()
    .findAll({ mutationKey: [OFFLINE_MUTATION_ROOT] })
    .filter((mutation) => mutation.state.status === "pending" || mutation.state.status === "error")
    .length;
}
