import { CourseAverageDTO } from "@/utils/types/objects/CourseAverageDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface PortalCourseAverageFilters {
  studentId?: string;
  schoolYearId?: string;
  schoolClassId?: string;
  evaluationPeriodId?: string | null;
  sysyId?: string | null;
}

export async function portalIndex(
  api: AxiosInstance,
  filters: PortalCourseAverageFilters,
): Promise<CourseAverageDTO[]> {
  const { data } = await api.get<ApiResponse<CourseAverageDTO[]>>(
    "/portal/course-averages",
    { params: filters },
  );

  return data.data;
}
