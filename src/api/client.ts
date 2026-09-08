import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";

interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
}

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.example.com";

const AUTH_STORAGE_KEY = "auth";
const SCHOOL_CODE_STORAGE_KEY = "school_code"; // code saisi au login, distinct du token

const AUTH_EXCLUDED_PATHS = ["/login", "/auth/refresh"];

const logOperations = Boolean(__DEV__) && false;

interface AuthData {
  access_token: string;
  refresh_token: string;
}

async function getAuth(): Promise<AuthData | null> {
  const raw = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function setAuth(data: AuthData): Promise<void> {
  await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(data));
}

async function removeAuth(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// --- Token refresh queue to avoid multiple refresh calls on concurrent 401s ---
let isRefreshing = false;
let failedQueue: {
  originalRequest: RetryableRequestConfig;
  resolve: (value: AxiosResponse) => void;
  reject: (reason: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  const queue = failedQueue;
  failedQueue = [];

  queue.forEach(({ originalRequest, resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }
    if (token) {
      originalRequest.headers.set("Authorization", `Bearer ${token}`);
    }
    api(originalRequest)
      .then(resolve)
      .catch((err: unknown) => {
        reject(err);
      });
  });
};

export const setAuthToken = (token: string | null) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

async function refreshToken(): Promise<string> {
  const auth = await getAuth();
  const schoolCode = await getSchoolCode();

  const refresh_token = auth?.refresh_token;
  if (!refresh_token)
    return Promise.reject(new Error("No refresh token available"));

  if (logOperations) {
    console.log("🔄 Refresh token en cours...");
  }

  const response = await axios.post<RefreshTokenResponse>(
    `${API_BASE_URL}/auth/refresh`,
    {
      refreshToken: refresh_token,
    },
    { headers: schoolCode ? { "X-School-Code": schoolCode } : {} },
  );

  const newAccessToken = response.data.access_token;
  const newRefreshToken = response.data.refresh_token ?? refresh_token;
  if (!newAccessToken) throw new Error("Invalid refresh response");

  await setAuth({
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
  });

  if (logOperations) {
    console.log("✅ Refresh token réussi");
  }

  return newAccessToken;
}

// ---------------- Request interceptor ----------------
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const auth = await getAuth();
    const schoolCode = await getSchoolCode();

    const token = auth?.access_token;
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    // Code école requis par l'API sur (quasi) toute requête, même avant login
    if (schoolCode) {
      config.headers.set("X-School-Code", schoolCode);
    }

    if (logOperations) {
      console.log(
        `📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        {
          schoolCode,
          hasToken: !!token,
          data: config.data,
        },
      );
    }

    // Add other headers or correlation ids here
    return config;
  },
  (error: unknown) =>
    Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

// ---------------- Response interceptor ----------------
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (logOperations) {
      console.log(
        `📥 ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data,
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    // Pas de réponse du tout = hors-ligne ou timeout, pas une erreur d'auth
    if (!error.response) {
      if (logOperations) {
        console.log(`❌ Pas de réponse (${error.code}) — ${error.message}`);
      }
      return Promise.reject(error);
    }

    if (logOperations) {
      console.log(
        `❌ ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response.data,
      );
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isAuthRoute = AUTH_EXCLUDED_PATHS.some((path) =>
      originalRequest?.url?.includes(path),
    );

    // Si error 401, pas déjà tenté un refresh, et pas une route d'auth elle-même
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        // queue the request and retry once token available
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({ originalRequest, resolve, reject });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        setAuthToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return await api(originalRequest);
      } catch (err) {
        const normalizedErr =
          err instanceof Error ? err : new Error(String(err));
        if (logOperations) {
          console.log(
            "❌ Échec du refresh, déconnexion",
            normalizedErr.message,
          );
        }
        processQueue(normalizedErr, null);
        await removeAuth(); // déconnexion propre si le refresh échoue
        return await Promise.reject(normalizedErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ---------------- Secure storage ----------------

async function getSchoolCode(): Promise<string | null> {
  return SecureStore.getItemAsync(SCHOOL_CODE_STORAGE_KEY);
}

export async function setSchoolCode(code: string): Promise<void> {
  await SecureStore.setItemAsync(SCHOOL_CODE_STORAGE_KEY, code);
}

export async function clearSchoolCode(): Promise<void> {
  await SecureStore.deleteItemAsync(SCHOOL_CODE_STORAGE_KEY);
}

export default api;
