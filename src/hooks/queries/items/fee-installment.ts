import api from "@/api/client";
import { index } from "@/api/endpoints/feeInstallment";
import { feeInstallmentKeys } from "@/utils/query-keys/fee-installment";
import type { FeeInstallment } from "@/utils/types/FeeInstallment";
import { useListQuery } from "../use-list-query";

export function useFeeInstallments({
  schoolYearId,
  generalClassId,
}: {
  schoolYearId: string | null | undefined;
  generalClassId: string | null | undefined;
}) {
  const filters = { schoolYearId: schoolYearId ?? null, generalClassId: generalClassId ?? null };

  const query = useListQuery<FeeInstallment>({
    queryKey: feeInstallmentKeys.list(filters),
    queryFn: () =>
      index(api, {
        schoolYearId: schoolYearId as string,
        generalClassId: generalClassId as string,
      }),
    label: "Grille des frais",
    enabled: Boolean(schoolYearId && generalClassId),
  });

  return {
    feeInstallments: query.data,
    feeInstallmentsError: query.error,
    feeInstallmentsIsLoading: query.isLoading,
    feeInstallmentsIsRefetching: query.isRefetching,
    loadFeeInstallments: query.refetch,
  };
}
