import { AxiosInstance } from "axios";

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export async function changePassword(
  api: AxiosInstance,
  payload: ChangePasswordPayload,
): Promise<void> {
  await api.post("/change-password", payload);
}
