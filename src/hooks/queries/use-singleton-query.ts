import { keepCachedDataOnError, OFFLINE_QUERY_GC_TIME, queryMeta } from '@/lib/offline/offline-queries';
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
  offline?: boolean;
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
  offline,
}: UseSingletonQueryOptions<T>) {
  const result = useQuery<T>({
    queryKey,
    queryFn,
    staleTime,
    gcTime: offline ? OFFLINE_QUERY_GC_TIME : gcTime,
    meta: queryMeta(label, offline),
    enabled,
    retry,
    refetchInterval,
    refetchOnWindowFocus,
  });

  return keepCachedDataOnError(result, offline);
}
