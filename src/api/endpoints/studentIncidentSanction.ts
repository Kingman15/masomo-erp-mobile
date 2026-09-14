import {
  StudentIncidentSanction,
  StudentIncidentSanctionStatus,
} from "@/utils/types/StudentIncidentSanction";
import { PortalSanctionDTO } from "@/utils/types/objects/PortalSanctionDTO";
import { PortalSanctionIncidentDTO } from "@/utils/types/objects/PortalSanctionIncidentDTO";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";
import PaginatedApiResponse from "../responses/PaginatedApiResponse";

interface StudentIncidentSanctionFilters {
  schoolYearId?: string | null;
  schoolClassId?: string | null;
  sanctionTypeId?: string | null;
  incidentTypeId?: string | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface PortalSanctionFilters {
  schoolYearId?: string;
  incidentTypeId?: string;
  sanctionTypeId?: string;
  status?: StudentIncidentSanctionStatus;
  startDate?: string;
  endDate?: string;
  schoolClassId?: string;
}

export interface PortalSanctionDetailDTO {
  sanction: PortalSanctionDTO;
  incident: PortalSanctionIncidentDTO;
}

export async function portalIndex(
  api: AxiosInstance,
  studentId: string,
  filters: PortalSanctionFilters,
): Promise<PortalSanctionDTO[]> {
  const { data } = await api.get<ApiResponse<PortalSanctionDTO[]>>(
    "/portal/student-sanctions",
    { params: { studentId, ...filters } },
  );
  return data.data;
}

export async function portalShow(
  api: AxiosInstance,
  studentId: string,
  sanctionId: string,
): Promise<PortalSanctionDetailDTO> {
  const { data } = await api.get<ApiResponse<PortalSanctionDetailDTO>>(
    `/portal/student-sanctions/${sanctionId}`,
    { params: { studentId } },
  );
  return data.data;
}

export async function index(
  api: AxiosInstance,
  filters: StudentIncidentSanctionFilters,
  page: number,
  perPage: number | "all",
): Promise<PaginatedApiResponse<StudentIncidentSanction>> {
  const { data } = await api.get<
    PaginatedApiResponse<StudentIncidentSanction>
  >("/student-incident-sanctions", { params: { ...filters, page, perPage } });
  return data;
}

export async function show(
  api: AxiosInstance,
  id: string,
): Promise<StudentIncidentSanction> {
  const { data } = await api.get<ApiResponse<StudentIncidentSanction>>(
    `/student-incident-sanctions/${id}`,
  );
  return data.data;
}
