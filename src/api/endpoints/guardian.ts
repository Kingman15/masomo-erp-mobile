import { Contact } from "@/utils/types/Contact";
import { Guardian } from "@/utils/types/Guardian";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface GuardianFilters {
  schoolYearId?: string | null;
  searchTerm?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: GuardianFilters,
): Promise<Guardian[]> {
  const { data } = await api.get<ApiResponse<Guardian[]>>("/guardians", {
    params: filters,
  });
  return data.data;
}

// Contacts typés (téléphone, WhatsApp, e-mail…) d'un tuteur, principal en tête.
export async function contacts(
  api: AxiosInstance,
  guardianId: string,
): Promise<Contact[]> {
  const { data } = await api.get<ApiResponse<Contact[]>>(
    `/guardians/${guardianId}/contacts`,
  );
  return data.data;
}
