import type { ClientMetadata } from "@/api/idempotency";
import Constants from "expo-constants";
import { Platform } from "react-native";

function pad(value: number, length = 2) {
  return String(Math.abs(value)).padStart(length, "0");
}

/**
 * ISO 8601 en heure locale avec son décalage (ex. 2026-09-27T07:30:00.000+01:00).
 * toISOString() donnerait l'heure UTC et perdrait le décalage local de l'appareil.
 */
export function toLocalIsoString(date: Date): string {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `.${pad(date.getMilliseconds(), 3)}` +
    `${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`
  );
}

/**
 * Métadonnées d'un envoi. `sentAt` est pris à chaque essai, `recordedAt` reste celui de la saisie.
 */
export function buildClientMetadata(
  recordedAt: string,
  queued: boolean,
): ClientMetadata {
  return {
    recordedAt,
    sentAt: toLocalIsoString(new Date()),
    queued,
    appVersion: Constants.expoConfig?.version ?? null,
    platform: Platform.OS,
  };
}
