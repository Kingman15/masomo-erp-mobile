import api from "@/api/client";
import { index } from "@/api/endpoints/evaluationPeriod";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { evaluationPeriodKeys } from "@/utils/query-keys/evaluation-period";
import { EvaluationPeriod } from "@/utils/types/EvaluationPeriod";
import { useListQuery } from "../use-list-query";

export function evaluationPeriodsQuery(): QueryDefinition<EvaluationPeriod[]> {
  return {
    queryKey: evaluationPeriodKeys.list(),
    queryFn: () => index(api),
    label: "Périodes d'évaluation",
  };
}

export function useEvaluationPeriods() {
  const query = useListQuery<EvaluationPeriod>({
    ...evaluationPeriodsQuery(),
    staleTime: Infinity,
    offline: true,
  });

  return {
    evaluationPeriods: query.data,
    evaluationPeriodsError: query.error,
    evaluationPeriodsIsLoading: query.isLoading,
    loadEvaluationPeriods: query.refetch,
    evaluationPeriodsIsFetching: query.isFetching,
  };
}
