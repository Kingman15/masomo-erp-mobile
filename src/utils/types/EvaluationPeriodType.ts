export interface EvaluationPeriodType {
  id: string;
  code: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  isSystem: boolean;
  comments?: string;
}
