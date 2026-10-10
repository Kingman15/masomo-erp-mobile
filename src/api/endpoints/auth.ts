import * as Device from "expo-device";
import api from "../client";

export interface LoginPayload {
  schoolCode: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string | null;

  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
    isSuperAdmin: boolean | null;

    role: {
      // Rôles système ou créés par l'école : le code ne sert pas au routage (voir roleCategory)
      code: string;
      name: string | null;
      roleCategory: "backoffice" | "teacher" | "portal";
    };

    permissions: string[];
    enabledModules: string[];
    accessibleModules: string[];
    // Titulaire d'au moins une classe : écrans réservés au titulaire (le serveur reste le garde-fou)
    isHomeroomTeacher?: boolean;
  // Mot de passe temporaire à remplacer avant tout le reste (l'API répond 403 PASSWORD_CHANGE_REQUIRED ailleurs)
  mustChangePassword?: boolean;
  };

  // Identité de l'école : renvoyée seulement après une connexion réussie
  school: {
    code: string;
    name: string;
    logo_url: string | null;
  };
}

// Confirme seulement que le code existe (204) : le nom de l'école arrive avec /login
export async function verifySchoolCode(code: string): Promise<void> {
  await api.get("/school/verify", {
    headers: { "X-School-Code": code },
  });
}

// Affiché dans "Sessions actives" (le user agent de l'app, okhttp/…, n'est pas parlant)
function deviceName(): string | null {
  const name = [Device.modelName, Device.osName].filter(Boolean).join(" · ");
  return name ? name.slice(0, 100) : null;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // Appareil personnel utilisé hors ligne : session longue (plafonnée côté API selon le rôle)
  const { data } = await api.post<LoginResponse>("/login", {
    ...payload,
    rememberMe: true,
    deviceName: deviceName(),
  });
  return data;
}

// Même ressource que le `user` de /login : rafraîchit rôle et permissions sans reconnexion
export async function me(): Promise<LoginResponse["user"]> {
  const { data } = await api.get<{ data: LoginResponse["user"] }>("/me");
  return data.data;
}

// Révocation au mieux : la déconnexion locale ne doit pas attendre le timeout d'écriture (45 s) sur un réseau lent
const LOGOUT_TIMEOUT_MS = 5_000;

export async function logout(): Promise<void> {
  await api.post("/logout", null, { timeout: LOGOUT_TIMEOUT_MS });
}
