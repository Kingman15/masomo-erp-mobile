import { GeneralClass } from "./GeneralClass";
import { Option } from "./Option";
import { SchoolClass } from "./SchoolClass";
import { SchoolYear } from "./SchoolYear";
import { Section } from "./Section";

export type StudentInternalRegulationTargetType =
  | "global"
  | "section"
  | "option"
  | "generalClass"
  | "schoolClass";

export interface StudentInternalRegulation {
  id: string;
  code: string | null;
  schoolYearId: string | null;
  targetType: StudentInternalRegulationTargetType | null;
  targetId: string | null;
  title: string | null;
  preamble: string | null;
  description: string | null;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
  isActive: boolean | null;
  comments: string | null;

  schoolYear: SchoolYear | null;
  target: Section | Option | GeneralClass | SchoolClass | null;

  targetTypeStr: string | null;
  targetStr: string | null;
}
