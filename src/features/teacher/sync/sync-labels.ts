import {
  getFailureCode,
  type OfflineFailure,
} from "@/lib/offline/offline-error";
import type { OfflinePayloads } from "@/lib/offline/offline-mutations";
import type { OfflineQueueItem } from "@/lib/offline/use-offline-queue";

export const OFFLINE_ITEM_TYPE_LABELS: Record<keyof OfflinePayloads, string> = {
  "lesson.create": "Leçon",
  "attendance.bulk": "Pointage",
  "grades.save": "Notes",
  "incident.teacherReport": "Incident",
};

export const OFFLINE_ITEM_STATE_LABELS: Record<
  OfflineQueueItem["state"],
  string
> = {
  waiting: "En attente du réseau",
  sending: "Envoi en cours",
  failed: "Refusé",
};

function countOf(data: unknown, field: string): number {
  if (data && typeof data === "object" && field in data) {
    const value = (data as Record<string, unknown>)[field];
    return Array.isArray(value) ? value.length : 0;
  }
  return 0;
}

function firstValidationMessage(data: unknown): string | null {
  if (!data || typeof data !== "object" || !("errors" in data)) return null;
  const errors = (data as { errors: unknown }).errors;
  if (!errors || typeof errors !== "object") return null;

  const first = Object.values(errors as Record<string, unknown>)[0];
  if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  return typeof first === "string" ? first : null;
}

/**
 * Explication lisible d'un refus, à partir du code métier renvoyé par l'API (contrats 409 du backend) ou, à défaut, de son message.
 */
export function describeFailure(failure: OfflineFailure | null): string {
  if (!failure) return "Envoi refusé.";

  if (failure.kind === "cancelled") {
    return "Envoi d'une autre session, abandonné.";
  }

  switch (getFailureCode(failure)) {
    case "LESSON_ALREADY_DECLARED":
      return "Une leçon est déjà déclarée pour ce créneau.";
    case "ATTENDANCE_CONFLICT": {
      const count = countOf(failure.data, "conflicts");
      return `${count} élève(s) déjà pointé(s) différemment pour cette session. Rien n'a été enregistré.`;
    }
    case "GRADES_CONFLICT": {
      const count = countOf(failure.data, "conflicts");
      return `${count} note(s) modifiée(s) sur le serveur depuis leur chargement. Rien n'a été enregistré.`;
    }
    case "SESSION_NOT_OPEN":
      return "La session de pointage n'est plus ouverte.";
    case "REGISTER_NOT_OPEN":
      return "Le registre de pointage n'est plus ouvert.";
  }

  if (failure.status === 403) {
    return "Vous n'avez pas les droits nécessaires pour cet envoi.";
  }

  return firstValidationMessage(failure.data) ?? failure.message;
}
