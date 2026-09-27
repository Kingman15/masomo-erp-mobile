import {
  keepCachedDataOnError,
  OFFLINE_QUERY_GC_TIME,
  queryMeta,
} from "@/lib/offline/offline-queries";
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
  // Gardée sur l'appareil pour le hors ligne (cf. lib/offline/offline-queries).
  offline?: boolean;
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
  offline,
}: UseListQueryOptions<T, TData>) {
  const result = useQuery<T[], Error, TData>({
    queryKey,
    queryFn,
    enabled,
    staleTime,
    gcTime: offline ? OFFLINE_QUERY_GC_TIME : gcTime,
    select,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    meta: queryMeta(label, offline),
  });

  return keepCachedDataOnError(result, offline);
}
