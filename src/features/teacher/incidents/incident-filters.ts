export type IncidentFiltersForm = {
  schoolYearId: string | null;
  incidentTypeId: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
};

export const emptyIncidentFilters: IncidentFiltersForm = {
  schoolYearId: null,
  incidentTypeId: null,
  status: null,
  startDate: null,
  endDate: null,
};
