import api from "@/api/client";
import { index } from "@/api/endpoints/section";
import { sectionKeys } from "@/utils/query-keys/section";
import { Section } from "@/utils/types/Section";
import { useListQuery } from "../use-list-query";

export function useSections() {
  const query = useListQuery<Section>({
    queryKey: sectionKeys.list(),
    queryFn: () => index(api),
    label: "Sections",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  return {
    sections: query.data ?? [],
    sectionsError: query.error,
    sectionsIsLoading: query.isLoading,
    sectionsIsFetching: query.isFetching,
    loadSections: query.refetch,
  };
}
