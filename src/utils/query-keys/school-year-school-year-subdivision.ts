export const schoolYearSchoolYearSubdivisionKeys = {
  all: ["schoolYearSchoolYearSubdivisions"] as const,

  list: (filters: { schoolYearId?: string | null }) =>
    [...schoolYearSchoolYearSubdivisionKeys.all, "list", filters] as const,
};
