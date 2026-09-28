import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";
import {
  persistQueryClientRestore,
  persistQueryClientSave,
  persistQueryClientSubscribe,
} from "@tanstack/react-query-persist-client";
import type { DehydrateOptions, QueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fileStorage } from "./file-storage";
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

// Le cache change en rafale pendant le préchargement : inutile de resérialiser plusieurs Mo chaque seconde. La file garde le délai par défaut (1 s).
const CACHE_THROTTLE_MS = 5_000;

function withOnly(
  client: PersistedClient,
  part: "mutations" | "queries",
): PersistedClient {
  return {
    ...client,
    clientState: {
      mutations: part === "mutations" ? client.clientState.mutations : [],
      queries: part === "queries" ? client.clientState.queries : [],
    },
  };
}

/**
 * File d'envois et cache de lecture sauvegardés séparément.
 * - La file, petite, reste dans AsyncStorage : sur Android, une valeur de plus de ~2 Mo s'y écrit mais ne se relit plus (limite CursorWindow).
 * - Le cache, sans limite de taille, va dans un fichier. Illisible, il est simplement perdu (il se recharge au retour du réseau) ; la file n'est jamais touchée.
 */
function createOfflinePersister(key: string): Persister {
  const queue = createAsyncStoragePersister({
    storage: AsyncStorage,
    key,
    serialize: (client) => JSON.stringify(withOnly(client, "mutations")),
  });
  const cache = createAsyncStoragePersister({
    storage: fileStorage,
    key,
    throttleTime: CACHE_THROTTLE_MS,
    serialize: (client) => JSON.stringify(withOnly(client, "queries")),
  });

  return {
    persistClient: async (client) => {
      await Promise.all([
        queue.persistClient(client),
        cache.persistClient(client),
      ]);
    },
    restoreClient: async () => {
      const saved = await queue.restoreClient();
      const cached = await Promise.resolve(cache.restoreClient()).catch(
        () => undefined,
      );
      if (!saved) return cached;

      // Ancien format (tout dans une seule valeur, pas encore de fichier) : les lectures sont encore dans la clé de la file.
      const queries =
        cached?.buster === saved.buster
          ? cached.clientState.queries
          : saved.clientState.queries;

      return { ...saved, clientState: { ...saved.clientState, queries } };
    },
    removeClient: async () => {
      await Promise.all([
        queue.removeClient(),
        Promise.resolve(cache.removeClient()).catch(() => undefined),
      ]);
    },
  };
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

  const persister = createOfflinePersister(key);

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
