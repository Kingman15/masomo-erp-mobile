import { SchoolClass } from "@/utils/types/SchoolClass";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface SchoolClassFilters {
  sectionId?: string | null;
  optionId?: string | null;
  cycleId?: string | null;
  generalClassId?: string | null;
  excludeByStudentAttendanceSessionId?: string | null;
  teacherId?: string | null;
  schoolYearId?: string | null;
  studentId?: string | null;
}

export async function index(
  api: AxiosInstance,
  filters: SchoolClassFilters,
): Promise<SchoolClass[]> {
  const { data } = await api.get<ApiResponse<SchoolClass[]>>(
    "/school-classes",
    { params: filters },
  );
  return data.data;
}

export async function show(
  api: AxiosInstance,
  id: string,
): Promise<SchoolClass> {
  const { data } = await api.get<ApiResponse<SchoolClass>>(
    `/school-classes/${id}`,
  );
  return data.data;
}
