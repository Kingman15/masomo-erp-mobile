import { TeachingSchedule } from "@/utils/types/TeachingSchedule";
import { TeachingScheduleDTO } from "@/utils/types/TeachingScheduleDTO";
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

interface TeachingScheduleGetSchedulesFilters {
  courseScheduleId?: string | null;
  schoolClassId?: string | null;
  courseId?: string | null;
}

export async function getSchedules(
  api: AxiosInstance,
  filters: TeachingScheduleGetSchedulesFilters,
): Promise<TeachingScheduleDTO[]> {
  const { data } = await api.get<ApiResponse<TeachingScheduleDTO[]>>(
    "/teaching-schedules/get-schedules",
    { params: filters },
  );
  return data.data;
}
