import api from "@/api/client";
import { currentTeacher, options } from "@/api/endpoints/employee";
import type { QueryDefinition } from "@/lib/offline/offline-queries";
import { employeeKeys } from "@/utils/query-keys/employee";
import { Employee, EmployeeOption } from "@/utils/types/Employee";
import { useListQuery } from "../use-list-query";
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

interface UseEmployeeOptionsParams {
  enabled?: boolean;
}

// Hors enseignant (direction, administration), « Pointé par » se choisit parmi le personnel, comme sur le web.
export function useEmployeeOptions({
  enabled = true,
}: UseEmployeeOptionsParams = {}) {
  const query = useListQuery<EmployeeOption>({
    queryKey: employeeKeys.options(),
    queryFn: () => options(api),
    label: "Employés",
    enabled,
    offline: true,
  });

  return {
    employees: query.data,
    employeesError: query.error,
    employeesIsLoading: query.isLoading,
    loadEmployees: query.refetch,
  };
}
