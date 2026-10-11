import type { FeeInstallment } from "@/utils/types/FeeInstallment";
import { AxiosInstance } from "axios";
import ApiResponse from "../responses/ApiResponse";

interface FeeInstallmentFilters {
  schoolYearId: string;
  generalClassId: string;
}

// Tranches des frais d'une classe générique, triées par type de frais, frais puis numéro de tranche.
export async function index(
  api: AxiosInstance,
  filters: FeeInstallmentFilters,
): Promise<FeeInstallment[]> {
  const { data } = await api.get<ApiResponse<FeeInstallment[]>>(
    "/fee-installments",
    { params: filters },
  );
  return data.data;
}
