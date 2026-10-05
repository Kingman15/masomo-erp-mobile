import { PortalStudentRankingResultDTO } from "@/utils/types/objects/PortalStudentRankingDTO";
import { StudentRankingDTO } from "@/utils/types/objects/StudentRankingDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface PortalStudentRankingFilters {
  studentId?: string;
  schoolYearId?: string;
  schoolClassId?: string;
  schoolPeriodId?: string | null;
  schoolYearTermId?: string | null;
}

export interface StudentRankingFilters {
  schoolYearId: string;
  schoolClassId: string;
  schoolPeriodId?: string | null;
  schoolYearTermId?: string | null;
}

// Palmarès d'une classe (personnel) ; un enseignant n'y accède que pour une classe dont il est titulaire (StudentRankingPolicy).
export async function index(
  api: AxiosInstance,
  filters: StudentRankingFilters,
): Promise<StudentRankingDTO[]> {
  const { data } = await api.get<ApiResponse<StudentRankingDTO[]>>(
    "/student-rankings",
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
  filters: PortalStudentRankingFilters,
): Promise<PortalStudentRankingResultDTO> {
  const { data } = await api.get<ApiResponse<PortalStudentRankingResultDTO>>(
    "/portal/student-rankings",
    { params: filters },
  );

  return data.data;
}
