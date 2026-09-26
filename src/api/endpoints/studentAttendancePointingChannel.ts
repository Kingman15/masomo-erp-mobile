import { StudentAttendancePointingChannel } from "@/utils/types/StudentAttendancePointingChannel";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function index(
  api: AxiosInstance,
): Promise<StudentAttendancePointingChannel[]> {
  const { data } = await api.get<
    ApiResponse<StudentAttendancePointingChannel[]>
  >("/student-attendance-pointing-channels");
  return data.data;
}
