import { Course } from "@/utils/types/Course";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface CourseFilters {
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  teacherId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: CourseFilters,
): Promise<Course[]> {
  const { data } = await api.get<ApiResponse<Course[]>>("/courses", {
    params: filters,
  });
  return data.data;
}

export async function followed(
  api: AxiosInstance,
  filters: CourseFilters,
): Promise<Course[]> {
  const { data } = await api.get<ApiResponse<Course[]>>("/courses/followed", {
    params: filters,
  });
  return data.data;
}
