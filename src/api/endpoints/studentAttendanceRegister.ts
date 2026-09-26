import { StudentAttendanceRegister } from "@/utils/types/StudentAttendanceRegister";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface StudentAttendanceRegisterFilters {
  schoolYearId?: string | null;
  status?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: StudentAttendanceRegisterFilters,
): Promise<StudentAttendanceRegister[]> {
  const { data } = await api.get<ApiResponse<StudentAttendanceRegister[]>>(
    "/student-attendance-registers",
    { params: filters },
  );
  return data.data;
}
