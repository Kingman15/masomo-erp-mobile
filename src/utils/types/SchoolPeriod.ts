import { SchoolPeriodType } from "./SchoolPeriodType";

export interface SchoolPeriod {
  id: string;
  code: string;
  name: string;
  periodTypeId: string;
  displayOrder: number;
  isActive: boolean;
  isSystem: boolean;
  description?: string;
  comments?: string;

  // Relations ===

  periodType: SchoolPeriodType | null;
}
