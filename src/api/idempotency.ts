import type { AxiosRequestConfig } from "axios";

// En-tête lu par le middleware `idempotent` de l'API : un même UUID rejoué
// renvoie la réponse déjà enregistrée au lieu de refaire l'écriture.
export const IDEMPOTENCY_HEADER = "X-Idempotency-Key";

export interface WriteRequestOptions {
  idempotencyKey?: string;
}

export function toRequestConfig(
  options: WriteRequestOptions = {},
): AxiosRequestConfig | undefined {
  if (!options.idempotencyKey) return undefined;

  return { headers: { [IDEMPOTENCY_HEADER]: options.idempotencyKey } };
}
