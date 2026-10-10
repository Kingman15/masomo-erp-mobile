import api from "@/api/client";
import { contacts, index } from "@/api/endpoints/guardian";
import { index as assignments } from "@/api/endpoints/guardianAssignment";
import { guardianKeys } from "@/utils/query-keys/guardian";
import { Contact } from "@/utils/types/Contact";
import { Guardian } from "@/utils/types/Guardian";
import { GuardianAssignment } from "@/utils/types/GuardianAssignment";
import { useListQuery } from "../use-list-query";

interface UseGuardiansParams {
  filters: {
    schoolYearId?: string | null;
    searchTerm?: string | null;
  };
  enabled?: boolean;
}

export function useGuardians({ filters, enabled = true }: UseGuardiansParams) {
  const normalizedFilters = {
    schoolYearId: filters.schoolYearId ?? undefined,
    searchTerm: filters.searchTerm?.trim() || undefined,
  };

  const query = useListQuery<Guardian>({
    queryKey: guardianKeys.list(normalizedFilters),
    queryFn: () => index(api, normalizedFilters),
    label: "Parents",
    enabled: Boolean(filters.schoolYearId) && enabled,
  });

  return {
    guardians: query.data ?? [],
    guardiansError: query.error,
    guardiansIsLoading: query.isLoading,
    guardiansIsFetching: query.isFetching,
    loadGuardians: query.refetch,
  };
}

interface UseGuardianAssignmentsParams {
  studentId: string | null | undefined;
  enabled?: boolean;
}

// Tuteurs d'un élève (fiche élève du personnel).
export function useGuardianAssignments({
  studentId,
  enabled = true,
}: UseGuardianAssignmentsParams) {
  const query = useListQuery<GuardianAssignment>({
    queryKey: guardianKeys.assignments(studentId),
    queryFn: () => assignments(api, { studentId }),
    label: "Tuteurs de l'élève",
    enabled: Boolean(studentId) && enabled,
  });

  return {
    guardianAssignments: query.data,
    guardianAssignmentsError: query.error,
    guardianAssignmentsIsLoading: query.isLoading,
  };
}

interface UseGuardianContactsParams {
  guardianId: string | null | undefined;
  enabled?: boolean;
}

export function useGuardianContacts({
  guardianId,
  enabled = true,
}: UseGuardianContactsParams) {
  const query = useListQuery<Contact>({
    queryKey: guardianKeys.contacts(guardianId),
    queryFn: () => contacts(api, guardianId as string),
    label: "Contacts du tuteur",
    enabled: Boolean(guardianId) && enabled,
  });

  return {
    contacts: query.data,
    contactsError: query.error,
    contactsIsLoading: query.isLoading,
  };
}
