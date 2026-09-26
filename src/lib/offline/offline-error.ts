import { isAxiosError } from "axios";

/**
 * Échec d'un envoi de la file offline, sous une forme sérialisable : l'erreur
 * est persistée avec la mutation (AsyncStorage), or une AxiosError sérialisée
 * perd `response.data`, donc le détail des conflits renvoyé par l'API.
 */
export interface OfflineFailure {
  // cancelled : envoi d'un autre compte, abandonné (cf. owner.ts).
  kind: "network" | "http" | "unknown" | "cancelled";
  status: number | null;
  message: string;
  // Corps de la réponse API (ex. { code: "ATTENDANCE_CONFLICT", conflicts: [...] })
  data: unknown;
}

export class OfflineMutationError extends Error {
  // Propriété énumérable : c'est elle qui survit à la persistance.
  failure: OfflineFailure;

  constructor(failure: OfflineFailure, cause: unknown) {
    // `cause` (non énumérable, non persisté) garde l'AxiosError d'origine pour
    // handleApiError quand l'écran traite lui-même l'erreur (envoi direct en ligne).
    super(failure.message, { cause });
    this.name = "OfflineMutationError";
    this.failure = failure;
  }
}

export function toOfflineMutationError(error: unknown): OfflineMutationError {
  if (error instanceof OfflineMutationError) return error;

  if (isAxiosError(error)) {
    if (!error.response) {
      return new OfflineMutationError(
        { kind: "network", status: null, message: error.message, data: null },
        error,
      );
    }

    const data: unknown = error.response.data;
    const message =
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : error.message;

    return new OfflineMutationError(
      { kind: "http", status: error.response.status, message, data },
      error,
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  return new OfflineMutationError(
    { kind: "unknown", status: null, message, data: null },
    error,
  );
}

/**
 * Lit l'échec d'une mutation, qu'elle vienne d'être exécutée (instance) ou
 * qu'elle ait été restaurée depuis le stockage (objet simple).
 */
export function getOfflineFailure(error: unknown): OfflineFailure | null {
  if (error && typeof error === "object" && "failure" in error) {
    return (error as { failure: OfflineFailure }).failure;
  }
  return null;
}

// Statuts qui peuvent réussir à un nouvel essai (serveur, limite de débit, session).
const TRANSIENT_STATUSES = new Set([401, 408, 419, 425, 429]);

/**
 * Réseau, session à rafraîchir, 5xx : on réessaie (la clé d'idempotence rend le
 * rejeu sûr). Les autres 4xx (409 conflit, 422 validation, 403…) sont définitifs.
 */
export function isRetryableFailure(failure: OfflineFailure | null): boolean {
  if (failure?.kind === "cancelled") return false;
  if (!failure || failure.kind !== "http" || failure.status === null) {
    return true;
  }
  return failure.status >= 500 || TRANSIENT_STATUSES.has(failure.status);
}

/** Code machine d'un refus métier (ex. LESSON_ALREADY_DECLARED), s'il y en a un. */
export function getFailureCode(failure: OfflineFailure | null): string | null {
  const data = failure?.data;
  if (data && typeof data === "object" && "code" in data && typeof data.code === "string") {
    return data.code;
  }
  return null;
}
