export type SanctionFiltersForm = {
  schoolYearId: string | null;
  schoolClassId: string | null;
  sanctionTypeId: string | null;
  incidentTypeId: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
};

export const emptySanctionFilters: SanctionFiltersForm = {
  schoolYearId: null,
  schoolClassId: null,
  sanctionTypeId: null,
  incidentTypeId: null,
  status: null,
  startDate: null,
  endDate: null,
};
