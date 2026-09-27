import type { AxiosRequestConfig } from "axios";

// En-tête lu par le middleware `idempotent` de l'API : un même UUID rejoué renvoie la réponse déjà enregistrée au lieu de refaire l'écriture.
export const IDEMPOTENCY_HEADER = "X-Idempotency-Key";

// En-têtes lus par le middleware `client.operation` de l'API (table client_operations) : ce que l'appareil déclare sur l'écriture, conservé à côté des horodatages serveur.
export const CLIENT_HEADERS = {
  recordedAt: "X-Client-Recorded-At",
  sentAt: "X-Client-Sent-At",
  queued: "X-Client-Queued",
  appVersion: "X-Client-App-Version",
  platform: "X-Client-Platform",
} as const;

export interface ClientMetadata {
  // Heure de la saisie sur l'appareil, ISO 8601 avec décalage local (ex. 2026-09-27T07:30:00.000+01:00).
  recordedAt: string;
  // Heure de l'appareil au moment de cet envoi (même format) : permet au serveur d'estimer le décalage de l'horloge.
  sentAt: string;
  // Saisie mise en file (hors ligne ou réseau en échec), envoyée plus tard.
  queued: boolean;
  appVersion: string | null;
  platform: string;
}

export interface WriteRequestOptions {
  idempotencyKey?: string;
  client?: ClientMetadata;
}

export function toRequestConfig(
  options: WriteRequestOptions = {},
): AxiosRequestConfig | undefined {
  const headers: Record<string, string> = {};

  if (options.idempotencyKey) {
    headers[IDEMPOTENCY_HEADER] = options.idempotencyKey;
  }

  if (options.client) {
    const { recordedAt, sentAt, queued, appVersion, platform } =
      options.client;
    headers[CLIENT_HEADERS.recordedAt] = recordedAt;
    headers[CLIENT_HEADERS.sentAt] = sentAt;
    headers[CLIENT_HEADERS.queued] = queued ? "1" : "0";
    headers[CLIENT_HEADERS.platform] = platform;
    if (appVersion) headers[CLIENT_HEADERS.appVersion] = appVersion;
  }

  return Object.keys(headers).length > 0 ? { headers } : undefined;
}
