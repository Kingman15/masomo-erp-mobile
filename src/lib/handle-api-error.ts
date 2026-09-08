import { isAxiosError } from "axios";
import { toastNotify } from "./toast";

export type ValidationErrors = Record<string, string[] | string>;

interface HandleApiErrorOptions {
  // Callback RHF (ex: setError du useForm)
  setFieldError?: (field: string, message: string) => void;

  onUnauthorized?: () => void; // 401
  onForbidden?: () => void; // 403
  onNotFound?: () => void; // 404
  onServerError?: () => void; // 500+

  defaultMessage?: string;
}

function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

function extractMessage(data: unknown, defaultMsg: string): string {
  if (!data || typeof data !== "object") {
    return typeof data === "string" ? data : defaultMsg;
  }

  const record = data as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;
  if (typeof record.error === "string") return record.error;
  if (typeof record.errors === "string") return record.errors;

  return defaultMsg;
}

export function handleApiError(
  error: unknown,
  options: HandleApiErrorOptions = {},
) {
  const {
    setFieldError,
    onUnauthorized,
    onForbidden,
    onNotFound,
    onServerError,
    defaultMessage = "Une erreur inattendue s'est produite. Veuillez réessayer.",
  } = options;

  if (!isAxiosError(error)) {
    toastNotify("Quelque chose s'est mal passé. Réessaie.", "error");
    console.error("[Runtime Error]", error);
    return;
  }

  if (!error.response) {
    toastNotify("Vérifie ta connexion internet et réessaie.", "error");
    return;
  }

  const status = error.response.status;
  const data = error.response.data as
    | { message?: string; error?: string; errors?: ValidationErrors }
    | undefined;
  const message = extractMessage(data, defaultMessage);

  switch (status) {
    case 422: {
      const errors = data?.errors;
      if (errors) {
        if (setFieldError) {
          Object.entries(errors).forEach(([field, msgs]) => {
            const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
            setFieldError(toCamelCase(field), msg);
          });
        } else {
          const allErrors = Object.values(errors).flat().join("\n");
          toastNotify(
            allErrors || "Vérifie les informations saisies.",
            "error",
          );
        }
      } else {
        toastNotify(message, "error");
      }
      break;
    }

    case 401:
      toastNotify("Ta session a expiré, reconnecte-toi.", "error");
      onUnauthorized?.();
      break;

    case 403:
      toastNotify(
        "Tu n'as pas les droits nécessaires pour effectuer cette action.",
        "error",
      );
      onForbidden?.();
      break;

    case 404:
      toastNotify(
        "L'élément demandé n'existe pas ou a été supprimé.",
        "error",
      );
      onNotFound?.();
      break;

    case 429:
      toastNotify("Trop de tentatives, patiente quelques instants.", "warning");
      break;

    case 503:
      toastNotify(
        "Service indisponible, réessaie dans quelques minutes.",
        "warning",
      );
      break;

    default:
      if (status >= 500) {
        toastNotify(
          "Un problème technique est survenu côté serveur.",
          "error",
        );
        onServerError?.();
      } else {
        toastNotify(message, "error");
      }
      break;
  }

  console.error(`[API Error ${status}]`, { url: error.config?.url, data });
}
