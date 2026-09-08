import PaginatedApiResponse from "@/api/responses/PaginatedApiResponse";
import { QueryKey, useInfiniteQuery } from "@tanstack/react-query";

interface UseInfiniteScrollQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: (page: number, perPage: number) => Promise<PaginatedApiResponse<T>>;
  label: string;
  enabled?: boolean;
  perPage?: number;
}

export function useInfiniteScrollQuery<T>({
  queryKey,
  queryFn,
  label,
  enabled = true,
  perPage = 25,
}: UseInfiniteScrollQueryOptions<T>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn(pageParam, perPage),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
    enabled,
    meta: { label },
  });

  return {
    items: query.data?.pages.flatMap((page) => page.data) ?? [],
    meta: query.data?.pages.at(-1)?.meta,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefetching: query.isRefetching,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
