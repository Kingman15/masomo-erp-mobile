import PaginatedApiResponse from "@/api/responses/PaginatedApiResponse";
import { QueryKey, useQuery } from "@tanstack/react-query";

interface UsePaginatedQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: (
    page: number,
    perPage: number | "all",
  ) => Promise<PaginatedApiResponse<T>>;
  label: string;
  enabled?: boolean;
  page: number;
  perPage?: number | "all";
}

export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  label,
  enabled = true,
  page,
  perPage = 25,
}: UsePaginatedQueryOptions<T>) {
  return useQuery<PaginatedApiResponse<T>>({
    queryKey: [...queryKey, page, perPage],
    queryFn: () => queryFn(page, perPage),
    enabled,
    meta: { label },
  });
}
