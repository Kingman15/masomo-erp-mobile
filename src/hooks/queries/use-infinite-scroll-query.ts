import PaginatedApiResponse from "@/api/responses/PaginatedApiResponse";
import { OFFLINE_QUERY_GC_TIME, queryMeta } from "@/lib/offline/offline-queries";
import { QueryKey, useInfiniteQuery } from "@tanstack/react-query";

export const INFINITE_SCROLL_PER_PAGE = 25;

// Partagé avec le préchargement hors ligne (même forme de cache que le hook).
export function getNextInfiniteScrollPage(lastPage: PaginatedApiResponse<unknown>) {
  return lastPage.meta && lastPage.meta.currentPage < lastPage.meta.lastPage
    ? lastPage.meta.currentPage + 1
    : undefined;
}

interface UseInfiniteScrollQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: (page: number, perPage: number) => Promise<PaginatedApiResponse<T>>;
  label: string;
  enabled?: boolean;
  perPage?: number;
  offline?: boolean;
}

export function useInfiniteScrollQuery<T>({
  queryKey,
  queryFn,
  label,
  enabled = true,
  perPage = INFINITE_SCROLL_PER_PAGE,
  offline,
}: UseInfiniteScrollQueryOptions<T>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn(pageParam, perPage),
    initialPageParam: 1,
    getNextPageParam: getNextInfiniteScrollPage,
    enabled,
    ...(offline && { gcTime: OFFLINE_QUERY_GC_TIME }),
    meta: queryMeta(label, offline),
  });

  return {
    items: query.data?.pages.flatMap((page) => page.data) ?? [],
    meta: query.data?.pages.at(-1)?.meta,
    // Lecture gardée sur l'appareil : les pages déjà là restent affichées si le rechargement échoue (cf. keepCachedDataOnError).
    error: offline && query.data ? null : query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefetching: query.isRefetching,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
