import api from "@/api/client";
import {
  bulkSave,
  grid,
  passMark,
  points,
  types,
} from "@/api/endpoints/enrollmentDecision";
import { enrollmentDecisionKeys } from "@/utils/query-keys/enrollment-decision";
import { enrollmentKeys } from "@/utils/query-keys/enrollment";
import type {
  DeliberationSession,
  EnrollmentDecisionBulkPayload,
  EnrollmentDecisionGrid,
  EnrollmentDecisionPoint,
  EnrollmentDecisionType,
} from "@/utils/types/EnrollmentDecision";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useListQuery } from "../use-list-query";
import { useSingletonQuery } from "../use-singleton-query";

// Délibération : en ligne uniquement (rien n'est gardé ni mis en file hors ligne), les propositions sont calculées par le serveur.

interface UseEnrollmentDecisionGridParams {
  schoolClassId?: string | null;
  schoolYearId?: string | null;
  session: DeliberationSession;
}

export function useEnrollmentDecisionGrid(filters: UseEnrollmentDecisionGridParams) {
  const { schoolClassId, schoolYearId, session } = filters;

  const query = useSingletonQuery<EnrollmentDecisionGrid>({
    queryKey: enrollmentDecisionKeys.grid(filters),
    queryFn: () =>
      grid(api, {
        schoolClassId: schoolClassId!,
        schoolYearId: schoolYearId!,
        session,
      }),
    label: "Délibération",
    enabled: Boolean(schoolClassId && schoolYearId),
  });

  return {
    decisionGrid: query.data,
    decisionGridError: query.error,
    decisionGridIsLoading: query.isLoading,
    decisionGridIsFetching: query.isFetching,
    loadDecisionGrid: query.refetch,
  };
}

export function useEnrollmentDecisionTypes() {
  const query = useListQuery<EnrollmentDecisionType>({
    queryKey: enrollmentDecisionKeys.types(),
    queryFn: () => types(api),
    label: "Types de décision",
    staleTime: Infinity,
  });

  return {
    decisionTypes: query.data ?? [],
    decisionTypesError: query.error,
    loadDecisionTypes: query.refetch,
  };
}

export function usePassMark() {
  const query = useSingletonQuery<string | null>({
    queryKey: enrollmentDecisionKeys.passMark(),
    queryFn: () => passMark(api),
    label: "Note de passage",
  });

  const value = query.data != null ? parseFloat(query.data) : NaN;

  return { passMark: Number.isNaN(value) ? null : value };
}

export function useSaveEnrollmentDecisions() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: EnrollmentDecisionBulkPayload) => bulkSave(api, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: enrollmentDecisionKeys.all });
      // La décision et le repêchage figurent sur le bulletin
      void queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
    },
  });

  return {
    saveEnrollmentDecisions: mutation.mutateAsync,
    saveEnrollmentDecisionsIsPending: mutation.isPending,
  };
}

// Points d'un élève (cours x période) : rechargés à chaque ouverture de la fiche, rien n'est gardé hors ligne.
export function useEnrollmentDecisionPoints(filters: {
  schoolClassId?: string | null;
  schoolYearId?: string | null;
  session: DeliberationSession;
  enrollmentId?: string | null;
}) {
  const { schoolClassId, schoolYearId, session, enrollmentId } = filters;

  const query = useListQuery<EnrollmentDecisionPoint>({
    queryKey: enrollmentDecisionKeys.points(filters),
    queryFn: () =>
      points(api, {
        schoolClassId: schoolClassId!,
        schoolYearId: schoolYearId!,
        session,
        enrollmentId: enrollmentId!,
      }),
    label: "Points de délibération",
    enabled: Boolean(schoolClassId && schoolYearId && enrollmentId),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  return {
    decisionPoints: query.data,
    decisionPointsError: query.error,
    decisionPointsIsLoading: query.isLoading,
    loadDecisionPoints: query.refetch,
  };
}
