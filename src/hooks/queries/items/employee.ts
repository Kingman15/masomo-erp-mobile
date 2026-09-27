import api from "@/api/client";
import { currentTeacher } from "@/api/endpoints/employee";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { employeeKeys } from "@/utils/query-keys/employee";
import { Employee } from "@/utils/types/Employee";
import { useSingletonQuery } from "../use-singleton-query";

interface UseCurrentTeacherParams {
  enabled?: boolean;
}

export function currentTeacherQuery(): QueryDefinition<Employee | null> {
  return {
    queryKey: employeeKeys.currentTeacher(),
    queryFn: () => currentTeacher(api),
    label: "Enseignant courant",
  };
}

export function useCurrentTeacher({
  enabled = true,
}: UseCurrentTeacherParams = {}) {
  const query = useSingletonQuery<Employee | null>({
    ...currentTeacherQuery(),
    staleTime: Infinity,
    enabled,
    offline: true,
  });

  return {
    currentTeacher: query.data,
    currentTeacherError: query.error,
    currentTeacherIsLoading: query.isLoading,
    loadCurrentTeacher: query.refetch,
  };
}
