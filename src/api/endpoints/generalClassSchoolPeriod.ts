import type { SchoolPeriod } from "@/utils/types/SchoolPeriod";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

// Périodes rattachées à une classe générique pour une année (référentiel, lecture libre).
export interface GeneralClassSchoolPeriod {
  id: string;
  generalClassId: string;
  schoolYearTermId: string;
  schoolPeriodId: string;
  startDate: string | null;
  endDate: string | null;
  schoolPeriod?: SchoolPeriod | null;
}

export async function index(
  api: AxiosInstance,
  filters: { schoolYearId: string; generalClassId: string },
): Promise<GeneralClassSchoolPeriod[]> {
  const { data } = await api.get<ApiResponse<GeneralClassSchoolPeriod[]>>(
    "/general-class-school-periods",
    { params: filters },
  );
  return data.data;
}
