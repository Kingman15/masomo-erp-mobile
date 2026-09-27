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
  // teacherId désigne alors le titulaire de la classe (pointage) plutôt qu'un enseignant de cours.
  homeroom?: boolean | null;
}

export async function index(
  api: AxiosInstance,
  { homeroom, ...filters }: SchoolClassFilters,
): Promise<SchoolClass[]> {
  const { data } = await api.get<ApiResponse<SchoolClass[]>>(
    "/school-classes",
    // La règle `boolean` de Laravel refuse la chaîne "true" d'un paramètre de requête.
    { params: { ...filters, homeroom: homeroom ? 1 : undefined } },
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
