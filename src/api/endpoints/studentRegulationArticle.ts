import { StudentRegulationArticleDTO } from "@/utils/types/StudentRegulationArticleDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function currentTree(
  api: AxiosInstance,
  regulationId: string,
): Promise<StudentRegulationArticleDTO[]> {
  const { data } = await api.get<ApiResponse<StudentRegulationArticleDTO[]>>(
    "/student-regulation-articles/current-tree",
    { params: { regulationId } },
  );
  return data.data;
}
