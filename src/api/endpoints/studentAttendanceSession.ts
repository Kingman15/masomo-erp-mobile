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

export interface StudentAttendanceSessionPayload {
  schoolYearId: string;
  registerId: string;
  attendanceDate: string; // AAAA-MM-JJ
  arrivalTime?: string | null; // HH:mm
  departureTime?: string | null;
  title?: string | null;
  description?: string | null;
}

// Création seule (en ligne) : la session reste ouverte ; le serveur y rattache chaque classe au premier pointage.
export async function store(
  api: AxiosInstance,
  payload: StudentAttendanceSessionPayload,
): Promise<StudentAttendanceSession> {
  const { data } = await api.post<ApiResponse<StudentAttendanceSession>>(
    "/student-attendance-sessions",
    {
      school_year_id: payload.schoolYearId,
      register_id: payload.registerId,
      attendance_date: payload.attendanceDate,
      arrival_time: payload.arrivalTime ?? null,
      departure_time: payload.departureTime ?? null,
      title: payload.title ?? null,
      description: payload.description ?? null,
      status: "open",
    },
  );
  return data.data;
}
