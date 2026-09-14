import { SchoolYearSubdivision } from "./objects/SchoolYearSubdivision";
import { SchoolYear } from "./SchoolYear";

export interface SchoolYearSchoolYearSubdivision {
  id: string;
  code: string;
  schoolYearId: string;
  schoolYearSubdivisionId: string;
  subdivisionNo: number;
  startDate: string | null;
  endDate: string | null;

  schoolYear: SchoolYear | null;
  schoolYearSubdivision: SchoolYearSubdivision | null;
}
