import { SchoolYear } from "@/utils/types/SchoolYear";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface SchoolYearFilters {
  studentId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: SchoolYearFilters,
): Promise<SchoolYear[]> {
  const { data } = await api.get<ApiResponse<SchoolYear[]>>("/school-years", {
    params: filters,
  });
  return data.data;
}

export async function current(
  api: AxiosInstance,
): Promise<SchoolYear | null> {
  const { data } = await api.get<ApiResponse<SchoolYear | null>>(
    "/school-years/current",
  );
  return data.data ?? null;
}

export async function show(
  api: AxiosInstance,
  id: string,
): Promise<SchoolYear> {
  const { data } = await api.get<ApiResponse<SchoolYear>>(
    `/school-years/${id}`,
  );
  return data.data;
}
