import { Employee } from "./Employee";
import { Guardian } from "./Guardian";
import { OrganizationUserRole } from "./OrganizationUserRole";
import { Student } from "./Student";

export interface User {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  gender: "male" | "female" | "other" | null;
  birthDate: Date | null;
  address: string | null;
  isActive: boolean | null;
  isSuperAdmin: boolean | null;
  isSystem: boolean | null;
  description: string | null;
  notes: string | null;

  role: OrganizationUserRole | null;
  employee: Employee | null;
  guardian: Guardian | null;
  student: Student | null;

  permissions: string[];
  enabledModules: string[];
  accessibleModules: string[];

  // ---

  targetId: string | null;
  genderStr: string | null;
}
