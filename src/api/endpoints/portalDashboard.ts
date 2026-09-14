import { PortalDashboardToday } from "@/utils/types/PortalDashboardToday";
import { PortalHouseholdResponse } from "@/utils/types/PortalHousehold";
import { StudentDashboardSummaryResponse } from "@/utils/types/PortalStudentDashboard";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function getHousehold(
  api: AxiosInstance,
): Promise<PortalHouseholdResponse> {
  const { data } = await api.get<PortalHouseholdResponse>(
    "/portal/dashboard/household",
  );
  return data;
}

interface StudentSummaryFilters {
  studentId: string;
  schoolYearId: string;
}

export async function getStudentSummary(
  api: AxiosInstance,
  filters: StudentSummaryFilters,
): Promise<StudentDashboardSummaryResponse> {
  const { data } = await api.get<StudentDashboardSummaryResponse>(
    "/portal/dashboard/summary",
    { params: filters },
  );
  return data;
}

interface StudentTodayFilters {
  studentId: string;
  schoolYearId: string;
  schoolClassId: string;
}

export async function getStudentToday(
  api: AxiosInstance,
  filters: StudentTodayFilters,
): Promise<PortalDashboardToday> {
  const { data } = await api.get<ApiResponse<PortalDashboardToday>>(
    "/portal/dashboard/today",
    { params: filters },
  );
  return data.data;
}
