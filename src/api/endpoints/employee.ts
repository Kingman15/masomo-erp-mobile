import { Employee } from "@/utils/types/Employee";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function currentTeacher(
  api: AxiosInstance,
): Promise<Employee | null> {
  const { data } = await api.get<ApiResponse<Employee | null>>(
    "/employees/current-teacher",
  );
  return data.data ?? null;
}
