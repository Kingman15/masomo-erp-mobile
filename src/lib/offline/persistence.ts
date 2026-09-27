import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";
import {
  persistQueryClientRestore,
  persistQueryClientSave,
  persistQueryClientSubscribe,
  removeOldestQuery,
} from "@tanstack/react-query-persist-client";
import type { DehydrateOptions, QueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  isOfflineMutationKey,
  markRestoredFailuresAsQueued,
  removeDuplicateOfflineMutations,
  resumeOfflineQueue,
} from "./offline-mutations";
import {
  isOfflineQueryMeta,
  OFFLINE_QUERY_GC_TIME,
  OFFLINE_QUERY_MAX_AGE_MS,
} from "./offline-queries";
import { setOfflineOwner, toOfflineOwner } from "./owner";

/**
 * Persistance AsyncStorage du cache TanStack Query, cloisonnée par école et par utilisateur : la file d'un compte n'est jamais rejouée sous un autre compte (poste partagé), et elle survit à une déconnexion (session expirée pendant une longue coupure) pour repartir à la reconnexion du même utilisateur.
 */

// À incrémenter uniquement si le format des variables persistées change : un changement invalide tout le cache stocké, file d'envois comprise.
const OFFLINE_CACHE_VERSION = "1";

// Inférieur à la rétention serveur des clés d'idempotence (30 jours) : un envoi rejoué tardivement retrouve toujours sa clé.
// Compté depuis la dernière sauvegarde, donc repoussé à chaque utilisation de l'app.
const OFFLINE_CACHE_MAX_AGE_MS = 25 * 24 * 60 * 60 * 1000;

export const offlineDehydrateOptions: DehydrateOptions = {
  // En attente (en pause ou en plein essai) et refusés (à traiter dans l'écran Synchronisation).
  shouldDehydrateMutation: (mutation) =>
    isOfflineMutationKey(mutation.options.mutationKey) &&
    (mutation.state.status === "pending" || mutation.state.status === "error"),

  // Lectures explicitement marquées pour le hors ligne (horaire, ROI, données des formulaires), tant qu'elles ne sont pas trop anciennes.
  shouldDehydrateQuery: (query) =>
    isOfflineQueryMeta(query.meta) &&
    query.state.status === "success" &&
    Date.now() - query.state.dataUpdatedAt < OFFLINE_QUERY_MAX_AGE_MS,
};

// Tout le cache tient dans une seule entrée AsyncStorage, file d'envois comprise : au-delà de cette taille, l'écriture ou la relecture peut échouer sur Android et emporter la file avec elle.
const MAX_SERIALIZED_LENGTH = 1_500_000;

/**
 * Sérialise en écartant si besoin les lectures les plus anciennes ; la file d'envois n'est jamais écartée.
 */
function serializeWithinLimit(client: PersistedClient): string {
  const serialized = JSON.stringify(client);
  if (serialized.length <= MAX_SERIALIZED_LENGTH) return serialized;

  const newestFirst = client.clientState.queries
    .map((query) => ({ query, length: JSON.stringify(query).length }))
    .sort((a, b) => b.query.state.dataUpdatedAt - a.query.state.dataUpdatedAt);

  let length = serialized.length;
  while (length > MAX_SERIALIZED_LENGTH) {
    const oldest = newestFirst.pop();
    if (!oldest) break;
    length -= oldest.length;
  }

  return JSON.stringify({
    ...client,
    clientState: {
      ...client.clientState,
      queries: newestFirst.map(({ query }) => query),
    },
  });
}

export function offlineStorageKey(schoolCode: string, userId: string) {
  return `masomo-offline:${schoolCode}:${userId}`;
}

interface ActivePersistence {
  persister: Persister;
  unsubscribe: () => void;
}

let active: ActivePersistence | null = null;
// Espace de stockage démarré (ou en cours de démarrage) : un second démarrage pour le même compte ne restaure rien.
let startedKey: string | null = null;
// Invalide un démarrage en cours si un autre démarrage ou un arrêt survient.
let generation = 0;

export async function startOfflinePersistence(
  queryClient: QueryClient,
  scope: { schoolCode: string; userId: string },
) {
  const key = offlineStorageKey(scope.schoolCode, scope.userId);
  // La file en mémoire fait déjà foi : la restaurer à nouveau y ajouterait une copie de chaque envoi (hydrate ne dédoublonne pas les mutations).
  if (startedKey === key) return;
  startedKey = key;

  const current = ++generation;

  active?.unsubscribe();
  active = null;

  // Avant la restauration : un envoi soumis pendant celle-ci appartient déjà au bon compte.
  setOfflineOwner(toOfflineOwner(scope.schoolCode, scope.userId));

  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key,
    serialize: serializeWithinLimit,
    // Écriture refusée malgré tout : on retente sans la lecture la plus ancienne.
    retry: removeOldestQuery,
  });

  try {
    await persistQueryClientRestore({
      queryClient,
      persister,
      maxAge: OFFLINE_CACHE_MAX_AGE_MS,
      buster: OFFLINE_CACHE_VERSION,
      // Les lectures restaurées ne sont observées par aucun écran : sans ça, elles quitteraient le cache au bout de quelques minutes, et la sauvegarde suivante avec lui.
      hydrateOptions: {
        defaultOptions: { queries: { gcTime: OFFLINE_QUERY_GC_TIME } },
      },
    });
  } catch (error) {
    if (current === generation) startedKey = null;
    throw error;
  }

  if (current !== generation) return;

  // Filet de sécurité, et nettoyage des sauvegardes qui contiennent déjà des copies.
  removeDuplicateOfflineMutations(queryClient);

  const unsubscribe = persistQueryClientSubscribe({
    queryClient,
    persister,
    buster: OFFLINE_CACHE_VERSION,
    dehydrateOptions: offlineDehydrateOptions,
  });

  active = { persister, unsubscribe };

  markRestoredFailuresAsQueued(queryClient);
  await resumeOfflineQueue(queryClient);
}

/**
 * Déconnexion ou changement d'école : sauvegarde l'état de l'utilisateur courant dans son propre espace, puis vide le cache en mémoire pour que le compte suivant ne voie ni ne rejoue rien de ce qui précède.
 */
export async function stopOfflinePersistence(queryClient: QueryClient) {
  generation++;
  startedKey = null;
  setOfflineOwner(null);

  const previous = active;
  active = null;

  if (previous) {
    previous.unsubscribe();
    await persistQueryClientSave({
      queryClient,
      persister: previous.persister,
      buster: OFFLINE_CACHE_VERSION,
      dehydrateOptions: offlineDehydrateOptions,
    });
  }

  queryClient.clear();
}
