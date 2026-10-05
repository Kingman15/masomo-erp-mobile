import { CourseAverageDTO } from "@/utils/types/objects/CourseAverageDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface PortalCourseAverageFilters {
  studentId?: string;
  schoolYearId?: string;
  schoolClassId?: string;
  schoolPeriodId?: string | null;
  schoolYearTermId?: string | null;
}

export interface CourseAverageFilters {
  schoolYearId: string;
  schoolClassId: string;
  schoolPeriodId?: string | null;
  schoolYearTermId?: string | null;
}

// Moyennes par cours d'une classe (personnel) ; pour un enseignant, l'API ne garde que ses propres cours.
export async function index(
  api: AxiosInstance,
  filters: CourseAverageFilters,
): Promise<CourseAverageDTO[]> {
  const { data } = await api.get<ApiResponse<CourseAverageDTO[]>>(
    "/course-averages",
    {
      params: {
        ...filters,
        schoolPeriodId: filters.schoolPeriodId ?? undefined,
        schoolYearTermId: filters.schoolYearTermId ?? undefined,
      },
    },
  );

  return data.data;
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
