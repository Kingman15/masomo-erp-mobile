import {
  clearSchoolCode,
  setSchoolCode as persistSchoolCode,
} from "@/api/client";
import {
  login as loginRequest,
  logout as logoutRequest,
  verifySchoolCode,
  type LoginPayload,
} from "@/api/endpoints/auth";
import { usePortalSelectionStore } from "@/stores/portal-selection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

type AuthStatus = "loading" | "needsSchool" | "needsCredentials" | "signedIn";

interface SchoolInfo {
  code: string;
  name: string;
  logoUrl: string | null;
}

interface User {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  isSuperAdmin: boolean | null;

  role: {
    code: "admin" | "teacher" | "guardian" | "teacher";
    name: string | null;
    roleCategory: "backoffice" | "teacher" | "portal";
  };

  permissions: string[];
  enabledModules: string[];
  accessibleModules: string[];
}

const AUTH_STORAGE_KEY = "auth";
const SCHOOL_INFO_KEY = "school_info";
const USER_STORAGE_KEY = "user";

interface AuthState {
  status: AuthStatus;
  school: SchoolInfo | null;
  user: User | null;
  error: string | null;

  hydrate: () => Promise<void>;
  submitSchoolCode: (code: string) => Promise<void>;
  changeSchool: () => Promise<void>;
  signIn: (payload: LoginPayload) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "loading",
  school: null,
  user: null,
  error: null,

  // Au démarrage : y a-t-il déjà une école + une session valides ?
  hydrate: async () => {
    const [rawSchool, rawAuth, rawUser] = await Promise.all([
      SecureStore.getItemAsync(SCHOOL_INFO_KEY),
      SecureStore.getItemAsync(AUTH_STORAGE_KEY),
      AsyncStorage.getItem(USER_STORAGE_KEY),
    ]);

    const school = rawSchool ? (JSON.parse(rawSchool) as SchoolInfo) : null;

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

  submitSchoolCode: async (code: string) => {
    set({ error: null });
    try {
      const info = await verifySchoolCode(code);

      const school: SchoolInfo = {
        code,
        name: info.name,
        logoUrl: info.logo_url,
      } as SchoolInfo;

      await SecureStore.setItemAsync(SCHOOL_INFO_KEY, JSON.stringify(school));
      await persistSchoolCode(code);

      set({ school, status: "needsCredentials" });
    } catch {
      set({ error: "Code école introuvable. Vérifie avec ton établissement." });
      throw new Error("invalid_school_code");
    }
  },

  changeSchool: async () => {
    await SecureStore.deleteItemAsync(SCHOOL_INFO_KEY);
    await clearSchoolCode();
    usePortalSelectionStore.getState().clearSelection();
    set({ school: null, status: "needsSchool", user: null });
  },

  signIn: async (payload: LoginPayload) => {
    set({ error: null });
    try {
      const res = await loginRequest(payload);

      await Promise.all([
        SecureStore.setItemAsync(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            access_token: res.access_token,
            refresh_token: res.refresh_token,
          }),
        ),
        AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user)),
      ]);

      set({ user: res.user, status: "signedIn" });
    } catch {
      set({ error: "Email ou mot de passe incorrect." });
      throw new Error("invalid_credentials");
    }
  },

  signOut: async () => {
    try {
      await logoutRequest();
    } catch {
      // best-effort, on déconnecte localement même si l'appel échoue
    }

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
