import { Employee, EmployeeOption } from "@/utils/types/Employee";
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

// Identité seule, pour les sélecteurs (ex. « Pointé par ») ; la fiche complète reste réservée aux RH.
export async function options(api: AxiosInstance): Promise<EmployeeOption[]> {
  const { data } = await api.get<ApiResponse<EmployeeOption[]>>(
    "/employees/options",
  );
  return data.data;
}
