import { QueryKey, useQuery } from '@tanstack/react-query';

interface UseSingletonQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  label: string;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
  retry?: boolean | number | ((failureCount: number, error: unknown) => boolean);
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
}

export function useSingletonQuery<T>({
  queryKey,
  queryFn,
  label,
  staleTime,
  gcTime,
  enabled,
  retry,
  refetchInterval,
  refetchOnWindowFocus,
}: UseSingletonQueryOptions<T>) {
  return useQuery<T>({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    meta: { label },
    enabled,
    retry,
    refetchInterval,
    refetchOnWindowFocus,
  });
}
