import { StudentAttendanceRecord } from "@/utils/types/StudentAttendanceRecord";
import { StudentAttendanceRecordSummary } from "@/utils/types/StudentAttendanceRecordSummary";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface StudentAttendanceRecordFilters {
  sessionId?: string;
  startDate?: string;
  endDate?: string;
  studentId?: string;
  schoolYearId?: string;
  pointingTypeId?: string;
  pointingChannelId?: string;
  justificationStatusId?: string;
  sectionId?: string;
  schoolClassId?: string;
}

export async function index(
  api: AxiosInstance,
  filters: StudentAttendanceRecordFilters,
): Promise<StudentAttendanceRecord[]> {
  const { data } = await api.get<ApiResponse<StudentAttendanceRecord[]>>(
    "/student-attendance-records",
    { params: filters },
  );
  return data.data;
}

export async function show(
  api: AxiosInstance,
  id: string,
): Promise<StudentAttendanceRecord> {
  const { data } = await api.get<ApiResponse<StudentAttendanceRecord>>(
    `/student-attendance-records/${id}`,
  );
  return data.data;
}

export async function summary(
  api: AxiosInstance,
  filters: StudentAttendanceRecordFilters,
): Promise<StudentAttendanceRecordSummary> {
  const { data } = await api.get<ApiResponse<StudentAttendanceRecordSummary>>(
    "/student-attendance-records/attendance-summary",
    { params: filters },
  );
  return data.data;
}
