import api from "@/api/client";
import { index as fetchGeneralClassSchoolPeriods } from "@/api/endpoints/generalClassSchoolPeriod";
import type { GeneralClassSchoolPeriod } from "@/api/endpoints/generalClassSchoolPeriod";
import { grid, mentions } from "@/api/endpoints/studentPeriodAppraisal";
import { useOfflineMutation } from "@/lib/offline/use-offline-mutation";
import { studentPeriodAppraisalKeys } from "@/utils/query-keys/student-period-appraisal";
import type {
  AppraisalMention,
  StudentPeriodAppraisalBulkResult,
  StudentPeriodAppraisalGridRow,
} from "@/utils/types/StudentPeriodAppraisal";
import { useListQuery } from "../use-list-query";

export function useStudentPeriodAppraisalGrid(filters: {
  schoolClassId?: string | null;
  schoolYearId?: string | null;
  schoolPeriodId?: string | null;
}) {
  const { schoolClassId, schoolYearId, schoolPeriodId } = filters;

  const query = useListQuery<StudentPeriodAppraisalGridRow>({
    queryKey: studentPeriodAppraisalKeys.grid(filters),
    queryFn: () =>
      grid(api, {
        schoolClassId: schoolClassId!,
        schoolYearId: schoolYearId!,
        schoolPeriodId: schoolPeriodId!,
      }),
    label: "Appréciations",
    enabled: Boolean(schoolClassId && schoolYearId && schoolPeriodId),
    // Grille déjà ouverte : consultable et modifiable sans réseau.
    offline: true,
  });

  return {
    appraisalGrid: query.data,
    appraisalGridError: query.error,
    appraisalGridIsLoading: query.isLoading,
    appraisalGridIsFetching: query.isFetching,
    loadAppraisalGrid: query.refetch,
  };
}

export function useAppraisalMentions() {
  const query = useListQuery<AppraisalMention>({
    queryKey: studentPeriodAppraisalKeys.mentions(),
    queryFn: () => mentions(api),
    label: "Mentions",
    staleTime: Infinity,
    offline: true,
  });

  return {
    appraisalMentions: query.data ?? [],
    appraisalMentionsIsLoading: query.isLoading,
  };
}

export function useGeneralClassSchoolPeriods(
  schoolYearId: string | null | undefined,
  generalClassId: string | null | undefined,
) {
  const query = useListQuery<GeneralClassSchoolPeriod>({
    queryKey: studentPeriodAppraisalKeys.generalClassSchoolPeriods(
      schoolYearId,
      generalClassId,
    ),
    queryFn: () =>
      fetchGeneralClassSchoolPeriods(api, {
        schoolYearId: schoolYearId!,
        generalClassId: generalClassId!,
      }),
    label: "Périodes de la classe",
    enabled: Boolean(schoolYearId && generalClassId),
    offline: true,
  });

  return {
    generalClassSchoolPeriods: query.data,
    generalClassSchoolPeriodsIsLoading: query.isLoading,
  };
}

// Saisie rejouable hors ligne (file offline), comme les notes.
export function useSaveStudentPeriodAppraisals() {
  const { submit, isPending } = useOfflineMutation<
    "appraisals.save",
    StudentPeriodAppraisalBulkResult
  >("appraisals.save");

  return {
    saveStudentPeriodAppraisals: submit,
    saveStudentPeriodAppraisalsIsPending: isPending,
  };
}
