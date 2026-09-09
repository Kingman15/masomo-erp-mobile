import api from "@/api/client";
import { index } from "@/api/endpoints/evaluationPeriod";
import { evaluationPeriodKeys } from "@/utils/query-keys/evaluation-period";
import { EvaluationPeriod } from "@/utils/types/EvaluationPeriod";
import { useListQuery } from "../use-list-query";

export function useEvaluationPeriods() {
  const query = useListQuery<EvaluationPeriod>({
    queryKey: evaluationPeriodKeys.list(),
    queryFn: () => index(api),
    label: "Périodes d'évaluation",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  return {
    evaluationPeriods: query.data,
    evaluationPeriodsError: query.error,
    evaluationPeriodsIsLoading: query.isLoading,
    loadEvaluationPeriods: query.refetch,
    evaluationPeriodsIsFetching: query.isFetching,
  };
}
