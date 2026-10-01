import { PortalStudentRankingResultDTO } from "@/utils/types/objects/PortalStudentRankingDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface PortalStudentRankingFilters {
  studentId?: string;
  schoolYearId?: string;
  schoolClassId?: string;
  schoolPeriodId?: string | null;
  schoolYearTermId?: string | null;
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
