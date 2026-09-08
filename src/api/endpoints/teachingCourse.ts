import { TeachingCourse } from "@/utils/types/TeachingCourse";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface TeachingCourseFilters {
  schoolYearId?: string | null;
  courseId?: string | null;
  schoolClassId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: TeachingCourseFilters,
): Promise<TeachingCourse[]> {
  const { data } = await api.get<ApiResponse<TeachingCourse[]>>(
    "/teaching-courses",
    { params: filters },
  );
  return data.data;
}

export async function show(
  api: AxiosInstance,
  id: string,
): Promise<TeachingCourse> {
  const { data } = await api.get<ApiResponse<TeachingCourse>>(
    `/teaching-courses/${id}`,
  );
  return data.data;
}
