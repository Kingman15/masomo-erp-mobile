import api from "@/api/client";
import { currentTree } from "@/api/endpoints/studentRegulationArticle";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { studentRegulationArticleKeys } from "@/utils/query-keys/student-regulation-article";
import { StudentRegulationArticleDTO } from "@/utils/types/StudentRegulationArticleDTO";
import { useListQuery } from "../use-list-query";

interface UseStudentRegulationArticlesParams {
  filters: {
    regulationId?: string | null;
  };
  enabled?: boolean;
}

export function studentRegulationArticlesQuery(
  regulationId: string | null,
): QueryDefinition<StudentRegulationArticleDTO[]> {
  return {
    queryKey: studentRegulationArticleKeys.currentTree(regulationId),
    queryFn: () => {
      if (!regulationId) {
        return Promise.reject(new Error("regulationId is required"));
      }
      return currentTree(api, regulationId);
    },
    label: "Articles du règlement",
  };
}

export function useStudentRegulationArticles({
  filters,
  enabled = true,
}: UseStudentRegulationArticlesParams) {
  const regulationId = filters.regulationId ?? null;

  const query = useListQuery<StudentRegulationArticleDTO>({
    ...studentRegulationArticlesQuery(regulationId),
    enabled: Boolean(regulationId) && enabled,
    offline: true,
  });

  return {
    studentRegulationArticles: query.data ?? [],
    studentRegulationArticlesError: query.error,
    studentRegulationArticlesIsLoading: query.isLoading,
    studentRegulationArticlesIsFetching: query.isFetching,
    loadStudentRegulationArticles: query.refetch,
  };
}
