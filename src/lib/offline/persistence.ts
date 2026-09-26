import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { Persister } from "@tanstack/react-query-persist-client";
import {
  persistQueryClientRestore,
  persistQueryClientSave,
  persistQueryClientSubscribe,
} from "@tanstack/react-query-persist-client";
import type { DehydrateOptions, QueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  isOfflineMutationKey,
  markRestoredFailuresAsQueued,
  resumeOfflineQueue,
} from "./offline-mutations";
import { setOfflineOwner, toOfflineOwner } from "./owner";

/**
 * Persistance AsyncStorage du cache TanStack Query, cloisonnée par école et par
 * utilisateur : la file d'un compte n'est jamais rejouée sous un autre compte
 * (poste partagé), et elle survit à une déconnexion (session expirée pendant
 * une longue coupure) pour repartir à la reconnexion du même utilisateur.
 */

// À incrémenter uniquement si le format des variables persistées change :
// un changement invalide tout le cache stocké, file d'envois comprise.
const OFFLINE_CACHE_VERSION = "1";

// Inférieur à la rétention serveur des clés d'idempotence (30 jours) : un
// envoi rejoué tardivement retrouve toujours sa clé. Compté depuis la dernière
// sauvegarde, donc repoussé à chaque utilisation de l'app.
const OFFLINE_CACHE_MAX_AGE_MS = 25 * 24 * 60 * 60 * 1000;

export const offlineDehydrateOptions: DehydrateOptions = {
  // En attente (en pause ou en plein essai) et refusés (à traiter dans l'écran Synchronisation).
  shouldDehydrateMutation: (mutation) =>
    isOfflineMutationKey(mutation.options.mutationKey) &&
    (mutation.state.status === "pending" || mutation.state.status === "error"),
  // Lectures explicitement marquées pour le hors ligne (horaire, ROI, données des formulaires).
  shouldDehydrateQuery: (query) =>
    query.meta?.offline === true && query.state.status === "success",
};

export function offlineStorageKey(schoolCode: string, userId: string) {
  return `masomo-offline:${schoolCode}:${userId}`;
}

interface ActivePersistence {
  persister: Persister;
  unsubscribe: () => void;
}

let active: ActivePersistence | null = null;
// Invalide un démarrage en cours si un autre démarrage ou un arrêt survient.
let generation = 0;

export async function startOfflinePersistence(
  queryClient: QueryClient,
  scope: { schoolCode: string; userId: string },
) {
  const current = ++generation;

  active?.unsubscribe();
  active = null;

  // Avant la restauration : un envoi soumis pendant celle-ci appartient déjà au bon compte.
  setOfflineOwner(toOfflineOwner(scope.schoolCode, scope.userId));

  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: offlineStorageKey(scope.schoolCode, scope.userId),
  });

  await persistQueryClientRestore({
    queryClient,
    persister,
    maxAge: OFFLINE_CACHE_MAX_AGE_MS,
    buster: OFFLINE_CACHE_VERSION,
  });

  if (current !== generation) return;

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
 * Déconnexion ou changement d'école : sauvegarde l'état de l'utilisateur
 * courant dans son propre espace, puis vide le cache en mémoire pour que le
 * compte suivant ne voie ni ne rejoue rien de ce qui précède.
 */
export async function stopOfflinePersistence(queryClient: QueryClient) {
  generation++;
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
