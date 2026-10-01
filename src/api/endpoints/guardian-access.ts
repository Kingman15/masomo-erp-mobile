import api from "../client";

// Activation du compte parent par le code remis par l'école (mêmes routes que le portail web)

export interface ActivationCheckResult {
  guardianName: string;
  suggestedUsername: string;
}

export type ActivationStatus = "pending" | "active";

export interface ActivationPayload {
  schoolCode: string;
  activationCode: string;
  phone: string;
  username: string;
  password: string;
  passwordConfirmation: string;
}

export async function checkActivationCode(
  schoolCode: string,
  activationCode: string,
): Promise<ActivationCheckResult> {
  const { data } = await api.post<{ data: ActivationCheckResult }>(
    "/guardian-access/check",
    { school_code: schoolCode, activation_code: activationCode },
  );
  return data.data;
}

export async function activateGuardianAccount(
  payload: ActivationPayload,
): Promise<ActivationStatus> {
  const { data } = await api.post<{ data: { status: ActivationStatus } }>(
    "/guardian-access/activate",
    {
      school_code: payload.schoolCode,
      activation_code: payload.activationCode,
      phone: payload.phone,
      username: payload.username,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
    },
  );
  return data.data.status;
}
