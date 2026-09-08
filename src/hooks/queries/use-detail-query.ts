import { QueryKey, useQuery } from '@tanstack/react-query';

interface UseDetailQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  label: string;
  id: string | undefined;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
}

export function useDetailQuery<T>({ queryKey, queryFn, label, id, staleTime, gcTime, refetchOnWindowFocus }: UseDetailQueryOptions<T>) {
  return useQuery<T>({
    queryKey,
    queryFn: () => {
      if (!id) return Promise.reject(new Error('No id provided'));
      return queryFn();
    },
    enabled: !!id,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    meta: { label },
  });
}
