import { CourseSchedule } from "@/utils/types/CourseSchedule";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function active(
  api: AxiosInstance,
  schoolYearId: string | null | undefined,
): Promise<CourseSchedule | null> {
  const { data } = await api.get<ApiResponse<CourseSchedule | null>>(
    "/course-schedules/active",
    { params: { schoolYearId } },
  );
  return data.data ?? null;
}
