import { StudentAttendanceSession } from "@/utils/types/StudentAttendanceSession";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface StudentAttendanceSessionFilters {
  registerId?: string | null;
  status?: string | null;
  shiftId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: StudentAttendanceSessionFilters,
): Promise<StudentAttendanceSession[]> {
  const { data } = await api.get<ApiResponse<StudentAttendanceSession[]>>(
    "/student-attendance-sessions",
    { params: filters },
  );
  return data.data;
}
