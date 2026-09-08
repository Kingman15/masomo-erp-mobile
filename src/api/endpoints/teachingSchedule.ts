import { TeachingSchedule } from "@/utils/types/TeachingSchedule";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface TeachingSchedulesByLessonDateFilters {
  schoolYearId?: string | null;
  courseId?: string | null;
  schoolClassId?: string | null;
  lessonDate?: string | null;
}

export async function byLessonDate(
  api: AxiosInstance,
  filters: TeachingSchedulesByLessonDateFilters,
): Promise<TeachingSchedule[]> {
  const { data } = await api.get<ApiResponse<TeachingSchedule[]>>(
    "/teaching-schedules/by-lesson-date",
    { params: filters },
  );
  return data.data;
}
