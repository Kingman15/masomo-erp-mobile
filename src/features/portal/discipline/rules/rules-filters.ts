import type { StudentInternalRegulationTargetType } from "@/utils/types/StudentInternalRegulation";

export type RulesFiltersForm = {
  targetType: StudentInternalRegulationTargetType;
  sectionId: string | null;
  optionId: string | null;
  generalClassId: string | null;
  schoolClassId: string | null;
  studentInternalRegulationId: string | null;
};

export const emptyRulesFilters: RulesFiltersForm = {
  targetType: "global",
  sectionId: null,
  optionId: null,
  generalClassId: null,
  schoolClassId: null,
  studentInternalRegulationId: null,
};

export function targetIdFromFilters(filters: RulesFiltersForm): string | null {
  switch (filters.targetType) {
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
