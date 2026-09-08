import api from "../client";

export async function checkHealth(): Promise<void> {
  await api.get("/health");
}
