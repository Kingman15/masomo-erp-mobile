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
      code: "admin" | "teacher" | "guardian" | "teacher";
      name: string | null;
      roleCategory: "backoffice" | "teacher" | "portal";
    };

    permissions: string[];
    enabledModules: string[];
    accessibleModules: string[];
  };
}

export interface SchoolLookupResponse {
  name: string;
  logo_url: string | null;
}

export async function verifySchoolCode(
  code: string,
): Promise<SchoolLookupResponse> {
  const { data } = await api.get<SchoolLookupResponse>("/school/verify", {
    headers: { "X-School-Code": code },
  });
  return data;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/login", payload);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/logout");
}
