import { SchoolCalendar } from "@/utils/types/SchoolCalendar";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

/** Pour un enseignant, l'API ne renvoie que les classes où il enseigne (TeacherScope). */
export async function fetchSchoolCalendar(
  api: AxiosInstance,
  schoolYearId: string,
): Promise<SchoolCalendar> {
  const { data } = await api.get<ApiResponse<SchoolCalendar>>(
    "/school-calendar",
    { params: { schoolYearId } },
  );
  return data.data;
}
