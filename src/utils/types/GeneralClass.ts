import { Cycle } from "./Cycle";
import { Option } from "./Option";
import { Section } from "./Section";

// -----------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------

export const GENERAL_CLASS_BULLETIN_TYPES = [
  "domain",
  "maxima",
  "branch",
] as const;
export const GENERAL_CLASS_SCHOOL_PERIODS = ["quarter", "semester"] as const;

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type GeneralClassBulletinType =
  (typeof GENERAL_CLASS_BULLETIN_TYPES)[number];
export type GeneralClassSchoolPeriod =
  (typeof GENERAL_CLASS_SCHOOL_PERIODS)[number];

// -----------------------------------------------------------------------
// Ressource
// -----------------------------------------------------------------------

export interface GeneralClass {
  id: string;
  code: string | null;
  sectionId: string | null;
  optionId: string | null;
  cycleId: string | null;
  level: number | null;
  title: string | null;
  abbreviation: string | null;
  isActive: boolean | null;
  displayOrder: number | null;
  bulletinType: GeneralClassBulletinType | null;
  schoolPeriod: GeneralClassSchoolPeriod | null;
  description: string | null;
  comments: string | null;

  // Relations ---

  section: Section | null;
  option: Option | null;
  cycle: Cycle | null;

  // Others ---

  activeSchoolClassesCount: number | null;

  // --- Non-mapped properties ---

  selected?: boolean;
}
