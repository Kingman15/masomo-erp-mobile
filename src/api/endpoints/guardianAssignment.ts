import { GuardianAssignment } from "@/utils/types/GuardianAssignment";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface GuardianAssignmentFilters {
  studentId?: string | null;
}

// Tuteurs d'un élève, avec le lien de parenté (texte libre) et les indicateurs principal / légal.
export async function index(
  api: AxiosInstance,
  filters: GuardianAssignmentFilters,
): Promise<GuardianAssignment[]> {
  const { data } = await api.get<ApiResponse<GuardianAssignment[]>>(
    "/guardian-assignments",
    { params: filters },
  );
  return data.data;
}
