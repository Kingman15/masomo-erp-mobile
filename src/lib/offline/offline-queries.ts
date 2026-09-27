import type { QueryClient, QueryKey, QueryMeta } from "@tanstack/react-query";

/**
 * Lectures gardées sur l'appareil pour le poste enseignant hors ligne (horaire, ROI, données des formulaires).
 * Une query marquée `offline` est persistée (cf. persistence.ts) et n'est jamais retirée du cache en mémoire : sinon une donnée consultée puis quittée disparaîtrait de la sauvegarde avant la coupure.
 */

// Pas de minuteur de nettoyage : le volume est borné par l'élagage à la sauvegarde (OFFLINE_QUERY_MAX_AGE_MS).
export const OFFLINE_QUERY_GC_TIME = Infinity;

// Une donnée non rafraîchie depuis plus longtemps n'est plus sauvegardée.
export const OFFLINE_QUERY_MAX_AGE_MS = 25 * 24 * 60 * 60 * 1000;

export function queryMeta(label: string, offline?: boolean): QueryMeta {
  return offline ? { label, offline: true } : { label };
}

export function isOfflineQueryMeta(meta: QueryMeta | undefined): boolean {
  return meta?.offline === true;
}

/**
 * Lecture gardée sur l'appareil dont le rechargement échoue (serveur injoignable alors que le téléphone se croit en ligne) : les données déjà là restent affichées, sans écran d'erreur.
 * Les écrans testent l'erreur avant les données : c'est ici qu'on la masque, pour tous à la fois.
 */
export function keepCachedDataOnError<
  R extends { data: unknown; error: unknown },
>(result: R, offline?: boolean): R {
  if (!offline || result.data === undefined || !result.error) return result;
  return { ...result, error: null, isError: false };
}

/**
 * Clé, fonction et libellé d'une lecture, partagés par le hook et le préchargement : une clé qui différerait d'un caractère rendrait le préchargement inutile.
 */
export interface QueryDefinition<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  label: string;
}

// Préchargement : une donnée récupérée depuis moins longtemps n'est pas redemandée.
export const PREFETCH_STALE_TIME_MS = 30 * 60 * 1000;

/**
 * Récupère (ou relit en cache si elle est récente) une lecture hors ligne, en lui donnant les mêmes options que le hook correspondant.
 */
export function fetchOfflineQuery<T>(
  queryClient: QueryClient,
  { queryKey, queryFn, label }: QueryDefinition<T>,
): Promise<T> {
  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: PREFETCH_STALE_TIME_MS,
    gcTime: OFFLINE_QUERY_GC_TIME,
    meta: queryMeta(label, true),
  });
}
