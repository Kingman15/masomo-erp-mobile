import { TeachingCourseEvaluationType } from "@/utils/types/TeachingCourseEvaluationType";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function index(
  api: AxiosInstance,
): Promise<TeachingCourseEvaluationType[]> {
  const { data } = await api.get<ApiResponse<TeachingCourseEvaluationType[]>>(
    "/teaching-course-evaluation-types",
  );
  return data.data;
}
