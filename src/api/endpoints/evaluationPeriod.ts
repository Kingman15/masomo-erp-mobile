import { EvaluationPeriod } from "@/utils/types/EvaluationPeriod";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function index(api: AxiosInstance): Promise<EvaluationPeriod[]> {
  const { data } = await api.get<ApiResponse<EvaluationPeriod[]>>(
    "/evaluation-periods",
  );
  return data.data;
}
