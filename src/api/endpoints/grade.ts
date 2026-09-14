import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";
import { PortalGradeDTO } from "@/utils/types/objects/PortalGradeDTO";

interface PortalGradeFilters {
  schoolYearId?: string;
  schoolClassId?: string;
  evaluationPeriodId?: string;
  courseId?: string;
}

export async function portalIndex(
  api: AxiosInstance,
  studentId: string,
  filters: PortalGradeFilters,
): Promise<PortalGradeDTO[]> {
  const { data } = await api.get<ApiResponse<PortalGradeDTO[]>>(
    `/portal/students/${studentId}/grades`,
    { params: filters },
  );

  return data.data;
}
