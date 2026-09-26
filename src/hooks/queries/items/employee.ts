import api from "@/api/client";
import { currentTeacher } from "@/api/endpoints/employee";
import { employeeKeys } from "@/utils/query-keys/employee";
import { Employee } from "@/utils/types/Employee";
import { useSingletonQuery } from "../use-singleton-query";

interface UseCurrentTeacherParams {
  enabled?: boolean;
}

export function useCurrentTeacher({
  enabled = true,
}: UseCurrentTeacherParams = {}) {
  const query = useSingletonQuery<Employee | null>({
    queryKey: employeeKeys.currentTeacher(),
    queryFn: () => currentTeacher(api),
    label: "Enseignant courant",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    enabled,
  });

  return {
    currentTeacher: query.data,
    currentTeacherError: query.error,
    currentTeacherIsLoading: query.isLoading,
    loadCurrentTeacher: query.refetch,
  };
}
