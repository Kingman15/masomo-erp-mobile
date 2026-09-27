import { keepCachedDataOnError, OFFLINE_QUERY_GC_TIME, queryMeta } from '@/lib/offline/offline-queries';
import { QueryKey, useQuery } from '@tanstack/react-query';

interface UseDetailQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  label: string;
  id: string | undefined;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  offline?: boolean;
}

export function useDetailQuery<T>({ queryKey, queryFn, label, id, staleTime, gcTime, refetchOnWindowFocus, offline }: UseDetailQueryOptions<T>) {
  const result = useQuery<T>({
    queryKey,
    queryFn: () => {
      if (!id) return Promise.reject(new Error('No id provided'));
      return queryFn();
    },
    enabled: !!id,
    staleTime,
    gcTime: offline ? OFFLINE_QUERY_GC_TIME : gcTime,
    refetchOnWindowFocus,
    meta: queryMeta(label, offline),
  });

  return keepCachedDataOnError(result, offline);
}
