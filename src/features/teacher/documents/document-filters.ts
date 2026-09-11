import type { DocumentAudienceType } from "./audience-type-options";

export type DocumentFiltersForm = {
  schoolYearId: string | null;
  audienceType: DocumentAudienceType | null;
  sectionId: string | null;
  optionId: string | null;
  generalClassId: string | null;
  schoolClassId: string | null;
};

export const emptyDocumentFilters: DocumentFiltersForm = {
  schoolYearId: null,
  audienceType: null,
  sectionId: null,
  optionId: null,
  generalClassId: null,
  schoolClassId: null,
};

export function audienceIdFromFilters(
  filters: DocumentFiltersForm,
): string | null {
  switch (filters.audienceType) {
    case "section":
      return filters.sectionId;
    case "option":
      return filters.optionId;
    case "generalClass":
      return filters.generalClassId;
    case "schoolClass":
      return filters.schoolClassId;
    default:
      return null;
  }
}
