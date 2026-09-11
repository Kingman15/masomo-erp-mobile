import { Section } from "@/utils/types/Section";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function index(api: AxiosInstance): Promise<Section[]> {
  const { data } = await api.get<ApiResponse<Section[]>>("/sections");
  return data.data;
}
