import {
  clearSchoolCode,
  setSchoolCode as persistSchoolCode,
  setSessionExpiredHandler,
} from "@/api/client";
import {
  login as loginRequest,
  logout as logoutRequest,
  verifySchoolCode,
  type LoginPayload,
} from "@/api/endpoints/auth";
import { stopOfflinePersistence } from "@/lib/offline/persistence";
import { queryClient } from "@/lib/queryClient";
import { usePortalSelectionStore } from "@/stores/portal-selection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

type AuthStatus = "loading" | "needsSchool" | "needsCredentials" | "signedIn";

export interface SchoolInfo {
  code: string;
  // Inconnus tant qu'aucune connexion n'a réussi dans cette école (le serveur ne les révèle qu'au login)
  name: string | null;
  logoUrl: string | null;
}

// École où une connexion a réussi sur cet appareil : son identité est donc connue
export interface KnownSchool {
  code: string;
  name: string;
  logoUrl: string | null;
  lastUsedAt: string;
}

const sameCode = (a: string, b: string) =>
  a.trim().toUpperCase() === b.trim().toUpperCase();

function sortByRecent(list: KnownSchool[]): KnownSchool[] {
  return [...list].sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt));
}

// Message du serveur pour un 403 (école/compte bloqué) ou un 429 (trop de tentatives)
function serverMessage(err: unknown): string | undefined {
  if (!isAxiosError<{ message?: string }>(err)) return undefined;
  const status = err.response?.status;

  return status === 403 || status === 429 ? err.response?.data?.message : undefined;
}

interface User {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  isSuperAdmin: boolean | null;

  role: {
    // TODO: le backend permet la creation des roles, meme si ceux enumérés ici sont des roles systeme
    code: "admin" | "teacher" | "guardian" | "teacher";
    name: string | null;
    roleCategory: "backoffice" | "teacher" | "portal";
  };

  permissions: string[];
  enabledModules: string[];
  accessibleModules: string[];
}

const AUTH_STORAGE_KEY = "auth";
// Dernière école où la connexion a réussi : présélectionnée au démarrage
const SCHOOL_INFO_KEY = "school_info";
// Pas de donnée sensible (code, nom, logo) : AsyncStorage suffit
const KNOWN_SCHOOLS_KEY = "known_schools";
const USER_STORAGE_KEY = "user";

interface AuthState {
  status: AuthStatus;
  /** École sélectionnée pour la connexion (pas forcément encore persistée) */
  school: SchoolInfo | null;
  knownSchools: KnownSchool[];
  user: User | null;
  error: string | null;

  hydrate: () => Promise<void>;
  /** Nouveau code : vérifié côté serveur, sélectionné en mémoire seulement */
  submitSchoolCode: (code: string) => Promise<void>;
  /** Code déjà sûr (école connue, ou validé par l'activation parent) : sélection sans appel serveur */
  selectSchool: (code: string) => void;
  forgetSchool: (code: string) => Promise<void>;
  signIn: (payload: LoginPayload) => Promise<void>;
  signOut: () => Promise<void>;
  /** Déconnexion locale uniquement (sans appel à /logout) */
  clearSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "loading",
  school: null,
  knownSchools: [],
  user: null,
  error: null,

  // Au démarrage : y a-t-il déjà une école + une session valides ?
  hydrate: async () => {
    const [rawSchool, rawAuth, rawUser, rawKnown] = await Promise.all([
      SecureStore.getItemAsync(SCHOOL_INFO_KEY),
      SecureStore.getItemAsync(AUTH_STORAGE_KEY),
      AsyncStorage.getItem(USER_STORAGE_KEY),
      AsyncStorage.getItem(KNOWN_SCHOOLS_KEY),
    ]);

    const school = rawSchool ? (JSON.parse(rawSchool) as SchoolInfo) : null;
    let knownSchools = rawKnown ? sortByRecent(JSON.parse(rawKnown) as KnownSchool[]) : [];

    // Installations antérieures à la liste : l'école enregistrée y entre d'office
    if (school?.name && !knownSchools.some((k) => sameCode(k.code, school.code))) {
      knownSchools = [
        { code: school.code, name: school.name, logoUrl: school.logoUrl, lastUsedAt: new Date().toISOString() },
        ...knownSchools,
      ];
      await AsyncStorage.setItem(KNOWN_SCHOOLS_KEY, JSON.stringify(knownSchools));
    }

    set({ knownSchools });

    if (!school) {
      set({ status: "needsSchool", school: null });
      return;
    }

    await persistSchoolCode(school.code);

    if (!rawAuth) {
      set({ status: "needsCredentials", school });
      return;
    }

    // Token présent : on considère signedIn, le client rafraîchira si expiré.
    const user = rawUser ? (JSON.parse(rawUser) as User) : null;
    set({ status: "signedIn", school, user });
  },

  // École gardée en mémoire seulement : elle n'est persistée qu'après une connexion réussie (signIn)
  submitSchoolCode: async (code: string) => {
    set({ error: null });
    try {
      await verifySchoolCode(code);
      get().selectSchool(code);
    } catch (err) {
      set({
        error:
          serverMessage(err) ??
          "Code école introuvable. Veuillez vérifier auprès de votre établissement.",
      });
      throw new Error("invalid_school_code");
    }
  },

  selectSchool: (code: string) => {
    const known = get().knownSchools.find((k) => sameCode(k.code, code));

    set({
      error: null,
      school: known
        ? { code: known.code, name: known.name, logoUrl: known.logoUrl }
        : { code, name: null, logoUrl: null },
      status: "needsCredentials",
    });
  },

  forgetSchool: async (code: string) => {
    const knownSchools = get().knownSchools.filter((k) => !sameCode(k.code, code));
    await AsyncStorage.setItem(KNOWN_SCHOOLS_KEY, JSON.stringify(knownSchools));

    // École retirée = école présélectionnée : elle ne doit plus revenir au prochain démarrage
    const rawSchool = await SecureStore.getItemAsync(SCHOOL_INFO_KEY);
    const persisted = rawSchool ? (JSON.parse(rawSchool) as SchoolInfo) : null;
    if (persisted && sameCode(persisted.code, code)) {
      await Promise.all([SecureStore.deleteItemAsync(SCHOOL_INFO_KEY), clearSchoolCode()]);
    }

    const current = get().school;
    if (current && sameCode(current.code, code)) {
      set({ knownSchools, school: null, status: "needsSchool" });
      return;
    }

    set({ knownSchools });
  },

  signIn: async (payload: LoginPayload) => {
    set({ error: null });
    try {
      const res = await loginRequest(payload);

      // Identité de l'école connue maintenant : mémorisée pour les prochaines connexions
      const school: SchoolInfo = {
        code: res.school.code,
        name: res.school.name,
        logoUrl: res.school.logo_url,
      };

      const knownSchools: KnownSchool[] = [
        { code: school.code, name: res.school.name, logoUrl: school.logoUrl, lastUsedAt: new Date().toISOString() },
        ...get().knownSchools.filter((k) => !sameCode(k.code, school.code)),
      ];

      await Promise.all([
        AsyncStorage.setItem(KNOWN_SCHOOLS_KEY, JSON.stringify(knownSchools)),
        SecureStore.setItemAsync(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            access_token: res.access_token,
            refresh_token: res.refresh_token,
          }),
        ),
        SecureStore.setItemAsync(SCHOOL_INFO_KEY, JSON.stringify(school)),
        persistSchoolCode(school.code),
        AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user)),
      ]);

      set({ school, knownSchools, user: res.user, status: "signedIn" });
    } catch (err) {
      // 403 : école/compte non actif, 429 : trop de tentatives ; le serveur fournit le motif à afficher
      const message = serverMessage(err);

      set({ error: message ?? "Email ou mot de passe incorrect." });
      throw new Error(message ? "login_refused" : "invalid_credentials");
    }
  },

  signOut: async () => {
    try {
      await logoutRequest();
    } catch {
      // best-effort, on déconnecte localement même si l'appel échoue
    }

    await get().clearSession();
  },

  clearSession: async () => {
    // Sauvegarde la file d'envois dans l'espace de ce compte (reprise à sa prochaine connexion) et vide le cache en mémoire avant le compte suivant.
    await stopOfflinePersistence(queryClient);

    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_STORAGE_KEY),
      AsyncStorage.removeItem(USER_STORAGE_KEY),
    ]);

    usePortalSelectionStore.getState().clearSelection();

    set({
      user: null,
      status: get().school ? "needsCredentials" : "needsSchool",
    });
  },

  clearError: () => set({ error: null }),
}));

// Refresh token invalide/expiré : retour à l'écran de connexion
setSessionExpiredHandler(() => {
  void useAuthStore.getState().clearSession();
});
