import { StudentAttendanceJustificationStatus } from "@/utils/types/StudentAttendanceJustificationStatus";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function index(
  api: AxiosInstance,
): Promise<StudentAttendanceJustificationStatus[]> {
  const { data } = await api.get<
    ApiResponse<StudentAttendanceJustificationStatus[]>
  >("/student-attendance-justification-statuses");
  return data.data;
}
