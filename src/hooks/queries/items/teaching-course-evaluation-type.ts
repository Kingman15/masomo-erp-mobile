import api from "@/api/client";
import { index } from "@/api/endpoints/teachingCourseEvaluationType";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { teachingCourseEvaluationTypeKeys } from "@/utils/query-keys/teaching-course-evaluation-type";
import { TeachingCourseEvaluationType } from "@/utils/types/TeachingCourseEvaluationType";
import { useListQuery } from "../use-list-query";

export function teachingCourseEvaluationTypesQuery(): QueryDefinition<
  TeachingCourseEvaluationType[]
> {
  return {
    queryKey: teachingCourseEvaluationTypeKeys.list(),
    queryFn: () => index(api),
    label: "Types d'évaluation",
  };
}

export function useTeachingCourseEvaluationTypes() {
  const query = useListQuery<TeachingCourseEvaluationType>({
    ...teachingCourseEvaluationTypesQuery(),
    staleTime: Infinity,
    offline: true,
  });

  return {
    teachingCourseEvaluationTypes: query.data,
    teachingCourseEvaluationTypesError: query.error,
    teachingCourseEvaluationTypesIsLoading: query.isLoading,
    loadTeachingCourseEvaluationTypes: query.refetch,
    teachingCourseEvaluationTypesIsFetching: query.isFetching,
  };
}
