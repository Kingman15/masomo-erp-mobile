import { EvaluationPeriodType } from "./EvaluationPeriodType";

export interface EvaluationPeriod {
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

  periodType: EvaluationPeriodType | null;
}
