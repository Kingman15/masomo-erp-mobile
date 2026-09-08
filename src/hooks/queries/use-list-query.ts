import { QueryKey, useQuery } from "@tanstack/react-query";

interface UseListQueryOptions<T, TData = T[]> {
  queryKey: QueryKey;
  queryFn: () => Promise<T[]>;
  label: string;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  select?: (data: T[]) => TData;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean | "always";
  refetchOnReconnect?: boolean;
}

export function useListQuery<T, TData = T[]>({
  queryKey,
  queryFn,
  label,
  enabled = true,
  staleTime,
  gcTime,
  select,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
}: UseListQueryOptions<T, TData>) {
  return useQuery<T[], Error, TData>({
    queryKey,
    queryFn,
    enabled,
    staleTime,
    gcTime,
    select,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    meta: { label },
  });
}
