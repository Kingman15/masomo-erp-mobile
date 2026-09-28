import { File, Paths } from "expo-file-system";

/**
 * Stockage clé → fichier JSON, au format attendu par createAsyncStoragePersister.
 * Contrairement à AsyncStorage, pas de limite de relecture (~2 Mo par valeur sur Android, limite CursorWindow).
 */
export const fileStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const file = fileFor(key);
    return file.exists ? file.text() : null;
  },
  setItem: (key: string, value: string) => {
    fileFor(key).write(value);
  },
  removeItem: (key: string) => {
    const file = fileFor(key);
    if (file.exists) file.delete();
  },
};

// Paths.document et non Paths.cache : Android peut vider ce dernier quand la mémoire manque, alors que l'enseignant est justement hors ligne.
function fileFor(key: string) {
  return new File(Paths.document, `${encodeURIComponent(key)}.json`);
}
