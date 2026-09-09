import api from "@/api/client";
import { index } from "@/api/endpoints/teachingCourseEvaluationType";
import { teachingCourseEvaluationTypeKeys } from "@/utils/query-keys/teaching-course-evaluation-type";
import { TeachingCourseEvaluationType } from "@/utils/types/TeachingCourseEvaluationType";
import { useListQuery } from "../use-list-query";

export function useTeachingCourseEvaluationTypes() {
  const query = useListQuery<TeachingCourseEvaluationType>({
    queryKey: teachingCourseEvaluationTypeKeys.list(),
    queryFn: () => index(api),
    label: "Types d'évaluation",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  return {
    teachingCourseEvaluationTypes: query.data,
    teachingCourseEvaluationTypesError: query.error,
    teachingCourseEvaluationTypesIsLoading: query.isLoading,
    loadTeachingCourseEvaluationTypes: query.refetch,
    teachingCourseEvaluationTypesIsFetching: query.isFetching,
  };
}
