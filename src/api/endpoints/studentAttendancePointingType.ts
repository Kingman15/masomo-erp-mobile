import { StudentAttendancePointingType } from "@/utils/types/StudentAttendancePointingType";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

export async function index(
  api: AxiosInstance,
): Promise<StudentAttendancePointingType[]> {
  const { data } = await api.get<ApiResponse<StudentAttendancePointingType[]>>(
    "/student-attendance-pointing-types",
  );
  return data.data;
}
