// -----------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------

export const EMPLOYEE_TYPE_STATUSES = ["draft", "active", "inactive"] as const;

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type EmployeeTypeStatus = (typeof EMPLOYEE_TYPE_STATUSES)[number];

// -----------------------------------------------------------------------
// Resource
// -----------------------------------------------------------------------

export interface EmployeeType {
  id: string;
  code: string;
  systemName: string | null;
  name: string | null;
  abbreviation: string | null;
  isSystem: boolean | null;
  isDefault: boolean | null;
  status: EmployeeTypeStatus | null;
  displayOrder: number | null;
  description: string | null;
  notes: string | null;
}
